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
    
    enum State : Equatable {
        case Idle
        case Recording(bestTranscription: String?)
        case Error(ErrorType)
        
        enum ErrorType : Equatable {
            case Unexpected(String)
        }
    }
    
    @Published var state: State = .Idle
    
    convenience init() {
        logger.info("initializing app state")
        self.init(accountNumber: "")
    }
    
    init(accountNumber: String) {
        self.accountNumber = accountNumber
    }
   
    func transition(newState: State) async {
        switch (state, newState)  {
        case (.Idle, .Recording),
             (.Recording, .Recording),
             (.Error, .Idle),
             (.Error, .Recording),
             (_, .Error):
            logger.info("transitioning to new state")
            state = newState
        default:
            logger.info("unxpected state transition")
            print(state, newState, "\n")
            state = .Error(
                .Unexpected("unxpected state transition from \(state) to \(newState)"))
        }
    }
}

