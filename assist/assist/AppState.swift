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

public indirect enum AppError: Error, LocalizedError {
    case AppLaunchError(Error)
    case Internal(String)
    case NoTranscriptionFound
    case UnexpectedTransition(AppState.State, AppState.State)
    case CommandNotFound(name: String)
    case CommandMismatchArgs(name: String, error: String)
    case CommandMismatchResult(name: String, expected: String, actual: String)
    case CouldNotAuthenticate(String? = nil)
    case CommandExecutionErrors([Error])
    case BadConfiguration(String? = nil)
    case InsufficientAppPermissions(String)

    public var errorDescription: String? {
        switch self {
        case .AppLaunchError(let e): return "could not launch app: \(e.localizedDescription)"
        case .Internal(let m): return "internal error: \(m)"
        case .UnexpectedTransition(let s1, let s2): return "cannot transition from \(s1) to \(s2)"
        case let .CommandNotFound(name: name): return "command not found: \(name)"
        case let .CommandMismatchArgs(name: name, error: m): return "command args mismatch: \(name), \(m)"
        case let .CommandMismatchResult(name: name, expected: expected, actual: actual):
            return "command \(name) return value type mismatch. expected \(expected) got \(actual)"
        case .CouldNotAuthenticate: return "authentication failure"
        case let .InsufficientAppPermissions(m): return "required permissions missing: \(m)"
        case .BadConfiguration: return "configuration error"
        default: return "unknown error: \(String.init(describing: self))"
        }
    }
}

public struct Message: Identifiable, Equatable {
    public let id: Int
    public let message: String
    public let type: MessageType
}

public enum MessageType: Equatable {
    case request
    case userResponse
    case modelResponse
}

@MainActor
public final class AppState: ObservableObject {

    public enum State {
        case Idle
        case AwaitingRequest
        case Processing(messages: [Message])
        case NeedsInput(messages: [Message], type: InputType)
        case Finished(messages: [Message])
        case Error(AppError)

        public enum InputType {
            case Confirm(message: String)
            case Question(message: String, onAnswer: (String) -> Void)
        }
    }

    static let shared = AppState()

    @AppStorage("accountNumber") var accountNumber: String = ""
    @Published var session: BashiSession? = nil
    @Published public private(set) var state: State = .Idle
    @Published public private(set) var currentTranscription: String? = nil
    
    public init(accountNumber: String? = nil) {
        logger.info("initializing app state")
        if let an = accountNumber {
            self.accountNumber = an
        }
    }

    public func canTransition(newState: State) -> Bool {
        switch (state, newState) {
        case (.Idle, .AwaitingRequest),
             (.Idle, .Processing),
             (.AwaitingRequest, .AwaitingRequest),
             (.AwaitingRequest, .Processing),
             (.Processing, .Processing),
             (.Processing, .NeedsInput),
             (.Processing, .Finished),
             (.NeedsInput, .Processing),
             (.Finished, .Idle),
             (.Finished, .AwaitingRequest),
             (.Finished, .Processing),
             (.Error, .Idle),
             (.Error, .AwaitingRequest),
             (_, .Error):
            return true
        default:
            return false
        }
    }

    private var semaphoreWaits: [CheckedContinuation<Void, Never>] = []
    private var semaphoreCount = 1

    public func withLock<R>(_ closure: () async throws -> R) async rethrows -> R {
        // wait
        #if DEBUG
            logger.debug("locking app state")
        #endif
        semaphoreCount -= 1
        if semaphoreCount < 0 {
            await withCheckedContinuation { semaphoreWaits.append($0) }
        }
        defer {
            // signal
            #if DEBUG
                logger.debug("un-locking app state")
            #endif
            semaphoreCount += 1
            if !semaphoreWaits.isEmpty {
                semaphoreWaits.removeFirst().resume()
            }
        }

        return try await closure()
    }
    
    public func update(currentTranscription s: String?) {
        currentTranscription = s
    }

    public func transition<R>(
        newState: State,
        closure: (() async -> Void) async throws -> R = { doTransition in await doTransition() }
    ) async throws -> R {
        #if DEBUG
            logger.debug("attempting to transition to state: \(String(describing: newState))")
        #endif
        return try await withLock {
            if !canTransition(newState: newState) {
                logger.error("unexpected transition from \(String(reflecting: self.state)) to \(String(reflecting: newState))")
                throw AppError.UnexpectedTransition(state, newState)
            }

            return try await closure({
                state = newState
                #if DEBUG
                    logger.debug("transitioned to state: \(String(describing: self.state))")
                #endif
            })
        }
    }

    public func handleError(_ e: Error) async {
        #if DEBUG
            logger.debug("handling error: \(String(reflecting: e))")
        #endif
        switch e {
        case AppError.UnexpectedTransition(let before, let after):
            logger.error("unexpected transition from \(String(reflecting: before)) to \(String(reflecting: after))")
        case let e as AppError:
            state = .Error(e)
        default:
            logger.error("internal error: \(String(reflecting: e))")
            state = .Error(.Internal(e.localizedDescription))
        }
    }
}
