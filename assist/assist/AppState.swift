//
//  SettingsModel.swift
//  assist
//
//  Created by Nathan Kot on 31/12/22.
//

import Foundation
import SwiftUI
import KeyboardShortcuts
import BashiClient
import Speech
import UserNotifications
import Combine

@MainActor
public final class AppState : ObservableObject {
    
    static let shared = AppState()
    
    @AppStorage("accountNumber") var accountNumber: String = ""
    @Published var session: BashiSession? = nil
    
    public enum State : Equatable {
        case Idle
        case Recording(bestTranscription: String?)
        case RequestPending(request: String)
        case AssistResult(ModelsAssist000Output)
        case Error(ErrorType)
    }

    public indirect enum ErrorType : Error, Equatable {
        case Internal(String) // TODO Internal should wrap another error
        case NoRequestFound
        case UnexpectedTransition(State, State)
        case CouldNotAuthenticate(String? = nil)
        case BadConfiguration(String? = nil)
        case InsufficientAppPermissions(String)
    }
    
    @Published public private(set) var state: State = .Idle
    
    public convenience init() {
        logger.info("initializing app state")
        self.init(accountNumber: "")
    }
    
    public init(accountNumber: String) {
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
    
    private var semaphoreWaits: [CheckedContinuation<Void, Never>] = []
    private var semaphoreCount = 1
    
    public func transition<R>(
        newState: State,
        closure: (() async -> Void) async throws -> R = { doTransition in await doTransition() }
    ) async throws -> R {
        // wait
        semaphoreCount -= 1
        if semaphoreCount < 0 {
            await withCheckedContinuation { semaphoreWaits.append($0) }
        }
        defer {
            // signal
            semaphoreCount += 1
            if !semaphoreWaits.isEmpty {
                semaphoreWaits.removeFirst().resume()
            }
        }
        
        if !canTransition(newState: newState) {
            logger.error("unexpected transition from \(String(reflecting: self.state)) to \(String(reflecting: newState))")
            throw ErrorType.UnexpectedTransition(state, newState)
        }
        
        return try await closure({ state = newState })
    }
    
    public func handleError(_ e: Error) async {
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

