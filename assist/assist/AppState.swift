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
        case RequestPending(request: String)
        case AssistResult(ModelsAssist000Output)
        case Error(ErrorType)
    }

    indirect enum ErrorType : Error, Equatable {
        case Internal(String)
        case NoRequestFound
        case UnexpectedTransition(State, State)
        case CouldNotAuthenticate(String? = nil)
        case BadConfiguration(String? = nil)
        case InsufficientAppPermissions(String)
    }
    
    @Published var state: State = .Idle
    
    convenience init() {
        logger.info("initializing app state")
        self.init(accountNumber: "")
    }
    
    init(accountNumber: String) {
        self.accountNumber = accountNumber
    }
    
    private func canTransition(newState: State) -> Bool {
        switch (state, newState)  {
        case (.Idle, .Recording),
             (.Idle, .RequestPending),
             (.Recording, .Recording),
             (.Recording, .RequestPending),
             (.RequestPending, .AssistResult),
             (.Error, .Idle),
             (.Error, .Recording),
             (_, .Error):
            return true
        default:
            return false
        }
    }
   
    func transition<R>(
        newState: State,
        closure: (() async -> Void) async throws -> R = { doTransition in await doTransition() }
    ) async throws -> R {
        if canTransition(newState: newState) {
            // TODO does this really prevent state update races?
            return try await closure({ state = newState })
        } else {
            logger.error("unexpected transition from \(String(reflecting: self.state)) to \(String(reflecting: newState))")
            throw ErrorType.UnexpectedTransition(state, newState)
        }
    }
    
    func handleError(_ e: Error) async {
        switch e {
        case ErrorType.UnexpectedTransition(let before, let after):
            logger.error("unexpected transition from \(String(reflecting: before)) to \(String(reflecting: after))")
        case let e as ErrorType:
            state = .Error(e)
        default:
            logger.error("internal error: \(String(reflecting: e))")
            state = .Error(.Internal(e.localizedDescription))
        }
    }
}

