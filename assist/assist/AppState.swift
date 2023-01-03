//
//  SettingsModel.swift
//  assist
//
//  Created by Nathan Kot on 31/12/22.
//

import Foundation
import SwiftUI
import KeyboardShortcuts
import Bashi
import Speech
import UserNotifications

@MainActor
final class AppState : ObservableObject {
    
    static let shared = AppState()
    
    @AppStorage("accountNumber") var accountNumber: String = ""
    @Published var session: BashiSession? = nil
    
    // Audio recording:
    @Published var isRecording: Bool = false
    @Published var speechRecognizerAuthStatus: SFSpeechRecognizerAuthorizationStatus = .notDetermined
    @Published var isAudioRecordingPrepared = false
    
    // Error handling:
    @Published var lastError: Error? = nil
    
    convenience init() {
        logger.info("initializing app state")
        self.init(accountNumber: "")
    }
    
    init(accountNumber: String) {
        self.accountNumber = accountNumber
    }
    
    func makeApiClient() -> APIClient {
        let accountNumber = accountNumber
        return APIClient(baseURL: Bashi.Server.main, defaultHeaders: [
            "Authorization": "Bearer \(accountNumber)",
        ])
    }
}

