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
    let pluginAPI: AppAPI
    
    let audioRecordingController: AudioRecordingController
    var keyboardShortcutsTask: Task<Void, Error>? = nil
    
    var transcriptionUpdatingTask: Task<Void, Error>? = nil
    
    init(state: AppState, pluginAPI: AppAPI) {
        self.state = state
        self.pluginAPI = pluginAPI
        self.audioRecordingController = AudioRecordingController()
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
            
            let modelOutput = try await state.transition(newState: .RequestPending(request: bestTranscription)) { doTransition in
                await doTransition()
                return try await assist(request: bestTranscription)
            }
            
            print(modelOutput)
//            try await state.transition(newState: .ProcessingResult(modelOutput))
        } catch {
            await state.handleError(error)
        }
    }
    
    
    
}

extension KeyboardShortcuts.Name {
    static let pushToTalk = Self("pushToTalk")
}

