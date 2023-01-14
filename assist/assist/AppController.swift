//
//  AppController.swift
//  assist
//
//  Created by Nathan Kot on 2/01/23.
//

import os
import Foundation
import BashiClient
import BashiPlugin
import KeyboardShortcuts
import Cocoa
import Combine

actor AppController {

    let state: AppState
    private let pluginAPI: AppAPI

    let audioRecordingController: AudioRecordingController
    let commandsController: CommandsController
    var keyboardShortcutsTask: Task<Void, Error>? = nil

    var transcriptionUpdatingTask: Task<Void, Error>? = nil

    init(state: AppState, pluginAPI: AppAPI, commandsController: CommandsController) {
        self.state = state
        self.pluginAPI = pluginAPI
        self.audioRecordingController = AudioRecordingController()
        self.commandsController = commandsController
    }

    deinit {
        keyboardShortcutsTask?.cancel()
    }

    func prepare() async {
        await audioRecordingController.prepare()

        if self.keyboardShortcutsTask == nil {
            logger.info("listening to keyboard shortcuts")
            keyboardShortcutsTask = Task {
                for await e in KeyboardShortcuts.events(for: .pushToTalk) {
                    switch e {
                    case .keyDown:
                        await startRecording()
                    case .keyUp:
                        await stopRecording()
                    }
                }
            }
        }
    }

    func startRecording() async {
        do {
            let transcriptions = try await state.transition(newState: .Recording(bestTranscription: nil)) { doTransition in
                let transcriptions = try await audioRecordingController.startRecording()
                await doTransition()
                return transcriptions
            }
            transcriptionUpdatingTask = Task {
                try Task.checkCancellation()
                for try await transcription in transcriptions {
                    try await state.transition(newState: .Recording(bestTranscription: transcription))
                }
            }
        } catch {
            await state.handleError(error)
        }
    }

    func stopRecording() async {
        do {
            transcriptionUpdatingTask?.cancel()
            transcriptionUpdatingTask = nil

            let bestTranscription = try await audioRecordingController.stopRecording()
            guard let bestTranscription = bestTranscription else {
                throw AppError.NoRequestFound
            }

            let requestContext: RequestContext = .init()
            let commandContext = CommandContext.from(request: bestTranscription, requestContext: requestContext)

            let modelOutput = try await state.transition(
                newState: .Processing(commandContext: commandContext)
            ) { doTransition in
                await doTransition()
                return try await assist(request: bestTranscription, requestContext: requestContext)
            }

            let finalCommandContext = try await commandsController.handle(
                assistResponse: modelOutput,
                commandContext: commandContext,
                onUpdatedContext: { [weak self] commandContext in
                    try? await self?.state.transition(newState: .Processing(commandContext: commandContext))
                }
            ) { confirmationMessage in
                // TODO support confirmation
                true
            }

            await debugPrint(finalCommandContext.getReturnValues())
            try await state.transition(newState: .Success(commandContext: finalCommandContext, "blah"))
        } catch {
            await state.handleError(error)
        }
    }

    func showSettings() async {
        await pluginAPI.showSettings()
    }

    func quit() async {
        await pluginAPI.quit()
    }
}

extension KeyboardShortcuts.Name {
    static let pushToTalk = Self("pushToTalk")
}

