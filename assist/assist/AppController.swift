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

extension KeyboardShortcuts.Name {
    static let pushToTalk = Self("pushToTalk")
}

actor AppController {

    let state: AppState
    let audioRecordingController: AudioRecordingController = AudioRecordingController()
    let commandsController: CommandsController
    let pluginsController: PluginsController
    let popover: NSPopover
    let statusBarItem: NSStatusItem

    var keyboardShortcutsTask: Task<Void, Error>? = nil
    var transcriptionUpdatingTask: Task<Void, Error>? = nil
    var pasteboardContextTask: Task<Void, Error>? = nil

    init(state: AppState,
        popover: NSPopover,
        statusBarItem: NSStatusItem,
        commandsController: CommandsController,
        pluginsController: PluginsController) {
        self.state = state
        self.popover = popover
        self.statusBarItem = statusBarItem
        self.commandsController = commandsController
        self.pluginsController = pluginsController
    }

    deinit {
        keyboardShortcutsTask?.cancel()
    }

    func prepare() async {
        if self.keyboardShortcutsTask == nil {
            logger.info("listening to keyboard shortcuts")
            keyboardShortcutsTask = Task {
                for await e in KeyboardShortcuts.events(for: .pushToTalk) {
                    let state = await state.state
                    switch e {
                    case .keyDown:
                        switch state {
                        case .Idle, .Finished, .Error:
                            await startRecordingRequest()
                        case .NeedsInput(_, type: .Question):
                            await startRecordingAnswer()
                        default:
                            break
                        }
                    case .keyUp:
                        switch state {
                        case .AwaitingRequest:
                            await stopRecordingRequest()
                        case .NeedsInput(_, type: .Question):
                            await stopRecordingAnswer()
                        default:
                            break
                        }
                    }
                }
            }
        }

        if self.pasteboardContextTask == nil {
            logger.info("periodically checking if text context needs to be extracted from pasteboard")
            pasteboardContextTask = Task {
                let pasteboard = NSPasteboard.general
                var lastChangeCount = 0
                while true {
                    let strings = pasteboard.readObjects(forClasses: [NSString.self]) ?? []
                    let newChangeCount = pasteboard.changeCount
                    if newChangeCount > lastChangeCount,
                        case let .NeedsInput(
                            messages: _,
                            type: .RequestContextText(
                                description: _,
                                onReceive: callback
                            )
                        ) = await state.state,
                        let text = strings.first as? String {
                        logger.info("found new string value in the Pasteboard, using as text context")
                        callback(text)
                    }
                    lastChangeCount = newChangeCount
                    try await Task.sleep(for: .milliseconds(500))
                }
            }
        }
    }

    func startRecordingAnswer() async {
        do {
            let transcriptions = try await audioRecordingController.startRecording()
            transcriptionUpdatingTask = Task {
                try Task.checkCancellation()
                for try await transcription in transcriptions {
                    await state.update(currentTranscription: transcription)
                }
                await state.update(currentTranscription: nil)
            }
        } catch {
            await state.handleError(error)
        }
    }

    func stopRecordingAnswer() async {
        do {
            let bestTranscription = try await audioRecordingController.stopRecording()
            let state = await state.state
            switch state {
            case let .NeedsInput(messages: _, type: .Question(_, onAnswer: onAnswer)):
                guard let bestTranscription = bestTranscription else {
                    throw AppError.NoTranscriptionFound
                }
                onAnswer(bestTranscription)
            default:
                throw AppError.Internal("expected state to be NeedsInput, Question")
            }
        } catch {
            await state.handleError(error)
        }
    }

    func startRecordingRequest() async {
        if await state.accountNumber.isEmpty {
            return
        }
        do {
            let transcriptions = try await state.transition(newState: .AwaitingRequest) { doTransition in
                let transcriptions = try await audioRecordingController.startRecording()
                await doTransition()
                await togglePopover(shouldShow: true)
                return transcriptions
            }
            transcriptionUpdatingTask = Task {
                try Task.checkCancellation()
                for try await transcription in transcriptions {
                    await state.update(currentTranscription: transcription)
                }
                await state.update(currentTranscription: nil)
            }
        } catch {
            await state.handleError(error)
        }
    }

    func stopRecordingRequest() async {
        do {
            transcriptionUpdatingTask?.cancel()
            transcriptionUpdatingTask = nil
            let bestTranscription = try await audioRecordingController.stopRecording()
            guard let bestTranscription = bestTranscription else {
                throw AppError.NoTranscriptionFound
            }
            Task {
                // Spin up a new task so that we do not block the app controller:
                await commandsController.process(initialRequest: bestTranscription)
            }
        } catch {
            await state.handleError(error)
        }
    }

    func dismissError() async {
        try? await state.transition(newState: .Idle)
    }

    func quit() async {
        await MainActor.run {
            NSApplication.shared.terminate(nil)
        }
    }

    func showSettings() async {
        await NSApp.sendAction(Selector(("showSettingsWindow:")), to: nil, from: nil)
        await togglePopover(shouldShow: false)
        await NSApp.activate(ignoringOtherApps: true)
    }

    func togglePopover(shouldShow: Bool? = nil) async {
        await MainActor.run {
            let isCurrentlyShown = self.popover.isShown
            let shouldShow = shouldShow ?? !isCurrentlyShown

            if !shouldShow {
                self.popover.performClose(nil)
            } else {
                if let button = self.statusBarItem.button {
                    self.popover.show(relativeTo: button.bounds, of: button, preferredEdge: NSRectEdge.minY)
                    self.popover.contentViewController?.view.window?.becomeKey()
                }
            }
        }
    }

}
