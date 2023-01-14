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
    private let appAPI: AppAPI

    let audioRecordingController: AudioRecordingController
    let commandsController: CommandsController
    let pluginsController: PluginsController
    var keyboardShortcutsTask: Task<Void, Error>? = nil

    var transcriptionUpdatingTask: Task<Void, Error>? = nil

    init(
        state: AppState,
        pluginAPI: AppAPI,
        commandsController: CommandsController,
        pluginsController: PluginsController
    ) {
        self.state = state
        self.appAPI = pluginAPI
        self.audioRecordingController = AudioRecordingController()
        self.commandsController = commandsController
        self.pluginsController = pluginsController
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
        if await state.accountNumber.isEmpty {
            return
        }
        do {
            let transcriptions = try await state.transition(newState: .Recording(bestTranscription: nil)) { doTransition in
                let transcriptions = try await audioRecordingController.startRecording()
                await doTransition()
                await appAPI.togglePopover(shouldShow: true)
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

            let handleResult = try await commandsController.handle(
                assistResponse: modelOutput,
                commandContext: commandContext,
                onUpdatedContext: { [weak self] commandContext in
                    try? await self?.state.transition(newState: .Processing(commandContext: commandContext))
                }
            ) { confirmationMessage in
                // TODO support confirmation
                true
            }

            switch handleResult {
            case .Success(renderResult: nil):
                try await state.transition(newState: .Idle) { doTransition in
                    await appAPI.togglePopover(shouldShow: false)
                    await doTransition()
                }
            case .Success(renderResult: let s):
                try await state.transition(newState: .Success(renderedResult: s!))
            case .HasErrors(
                renderResult: let s,
                successfulCommandsCount: _,
                errors: let errors):
                if let s = s {
                    try await state.transition(
                        newState: .Success(renderedResult: s))
                } else {
                    try await state.transition(
                        newState: .Error(.CommandExecutionErrors(errors)))
                }
            }

        } catch {
            await state.handleError(error)
        }
    }

    func dismissError() async {
        try? await state.transition(newState: .Idle)
    }

    func showSettings() async {
        await appAPI.showSettings()
    }

    func quit() async {
        await appAPI.quit()
    }
}

extension KeyboardShortcuts.Name {
    static let pushToTalk = Self("pushToTalk")
}

