//
//  AppController.swift
//  assist
//
//  Created by Nathan Kot on 2/01/23.
//

import os
import Foundation
import Bashi
import KeyboardShortcuts
import Cocoa
import Combine

actor AppController {
    
    let state: AppState
    let popover: NSPopover
    let statusBarItem: NSStatusItem
    
    let audioRecordingController: AudioRecordingController
    var keyboardShortcutsTask: Task<Void, Error>? = nil
    
    init(state: AppState, popover: NSPopover, statusBarItem: NSStatusItem, keyboardShortcutsTask: Task<Void, Error>? = nil) {
        self.state = state
        self.popover = popover
        self.statusBarItem = statusBarItem
        self.keyboardShortcutsTask = keyboardShortcutsTask
        self.audioRecordingController = AudioRecordingController(state: state)
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
            try await state.transition(newState: .Recording(bestTranscription: nil)) { doTransition in
                try await audioRecordingController.startRecording()
                await doTransition()
            }
        } catch {
            await state.handleError(error)
        }
    }
    
    func stopRecording() async {
        do {
            let bestTranscription = try await audioRecordingController.stopRecording()
            guard let bestTranscription = bestTranscription else {
                throw AppState.ErrorType.NoRequestFound
            }
            
            let modelOutput = try await state.transition(newState: .RequestPending(request: bestTranscription)) { doTransition in
                await doTransition()
                return try await assist(request: bestTranscription)
            }
            
            try await state.transition(newState: .AssistResult(modelOutput))
        } catch {
            await state.handleError(error)
        }
    }
    
    
    func showSettings() async {
        await MainActor.run {
            popover.performClose(nil)
            NSApp.sendAction(Selector(("showSettingsWindow:")), to: nil, from: nil)
        }
    }
    
    func quit() async {
        await MainActor.run {
            NSApplication.shared.terminate(nil)
        }
    }
    
    func togglePopover(shouldShow: Bool? = nil) async {
        let isCurrentlyShown = await self.popover.isShown
        let shouldShow = shouldShow ?? !isCurrentlyShown
        
        if !shouldShow {
            await self.popover.performClose(nil)
        } else {
            if let button = self.statusBarItem.button {
                await self.popover.show(relativeTo: button.bounds, of: button, preferredEdge: NSRectEdge.minY)
                await self.popover.contentViewController?.view.window?.becomeKey()
            }
        }
    }
    
}

extension KeyboardShortcuts.Name {
    static let pushToTalk = Self("pushToTalk")
}

