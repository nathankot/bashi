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

actor AppController {
    
    let state: AppState
    let popover: NSPopover
    
    let audioRecordingController: AudioRecordingController
    
    var keyboardShortcutsTask: Task<Void, Error>? = nil
    
    init(state: AppState, popover: NSPopover, keyboardShortcutsTask: Task<Void, Error>? = nil) {
        self.state = state
        self.popover = popover
        self.audioRecordingController = AudioRecordingController()
    }
    
    deinit {
        keyboardShortcutsTask?.cancel()
    }
    
    func prepare() async {
        await audioRecordingController.prepare()
        listenToKeyboardShortcuts()
    }
    
    func listenToKeyboardShortcuts() {
        if self.keyboardShortcutsTask != nil {
            return
        }
        logger.info("listening to keyboard shortcuts")
        self.keyboardShortcutsTask = Task { [weak self] in
            for await e in KeyboardShortcuts.events(for: .pushToTalk) {
                switch e {
                case .keyDown:
                    do {
                        try await self?.audioRecordingController.startRecording()
                        await self?.state.transition(newState: .Recording(bestTranscription: nil))
                    } catch {
                        await self?.unexpectedError(error)
                    }
                    
                    Task { [weak self] in
                        if let transcribeStream = await self?.audioRecordingController.transcribe() {
                            do {
                                for try await transcription in transcribeStream {
                                    logger.info("transitioning with \(transcription) \(self == nil)")
                                    await self?.state.transition(newState: .Recording(bestTranscription: transcription))
                                }
                            } catch {
                                await self?.unexpectedError(error)
                            }
                        }
                    }
                case .keyUp:
                    await self?.audioRecordingController.stopRecording()
                }
            }
        }
    }
    
    func refreshSession(force: Bool = false) async throws {
        enum SessionError : Error {
            case HTTP(Int, String)
            case Internal(String)
        }
        
        let accountNumber = await state.accountNumber
        if !force {
            if let session = await state.session {
                if session.expiresAt.compare(Date().addingTimeInterval(-60*10)) == .orderedDescending &&
                    session.accountNumber == accountNumber {
                    // Nothing to do as the current session is still valid
                    // for at least another 10 minutes.
                    return
                }
            }
        }
        
        let apiClient = await makeApiClient()
        let request = Bashi.PostSessions.Request(
            body: .init(modelConfigurations: .init(
                assist000: .init(model: .assist000, functions: [:])))
        )
        let response = await withCheckedContinuation { continuation in
            apiClient.makeRequest(request, complete: { response in
                continuation.resume(returning: response)
            })
        }
        let r = try response.result.get()
        if let e = r.failure {
            throw SessionError.HTTP(r.statusCode, e.error)
        }
        if r.success == nil {
            throw SessionError.Internal("unexpected response deserialization failure")
        }
        await MainActor.run {
            state.session = r.success!.session
        }
    }
    
    func makeApiClient() async -> APIClient {
        let accountNumber = await state.accountNumber
        return APIClient(baseURL: Bashi.Server.main, defaultHeaders: [
            "Authorization": "Bearer \(accountNumber)",
        ])
    }
    
    func unexpectedError(_ err: Error) async {
        logger.error("\(err.localizedDescription)")
        await state.transition(newState: .UnexpectedError(errorMessage: err.localizedDescription))
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
}

extension KeyboardShortcuts.Name {
    static let pushToTalk = Self("pushToTalk")
}

