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
    let popover: NSPopover
    let statusBarItem: NSStatusItem

    let audioRecordingController: AudioRecordingController = AudioRecordingController()
    let commandsController: CommandsController
    let pluginsController: PluginsController
    var keyboardShortcutsTask: Task<Void, Error>? = nil

    var transcriptionUpdatingTask: Task<Void, Error>? = nil

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
                await togglePopover(shouldShow: true)
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

            try await commandsController.process(initialRequest: bestTranscription)
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

extension KeyboardShortcuts.Name {
    static let pushToTalk = Self("pushToTalk")
}

