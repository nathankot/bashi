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

public indirect enum AppError : Error {
    case AppLaunchError(Error)
    case Internal(String)
    case NoRequestFound
    case UnexpectedTransition(AppState.State, AppState.State)
    case CouldNotAuthenticate(String? = nil)
    case CommandExecutionErrors([Error])
    case BadConfiguration(String? = nil)
    case InsufficientAppPermissions(String)
}

@MainActor
public final class AppState : ObservableObject {

    static let shared = AppState()

    #if DEBUG
    @Published var accountNumber: String = "123"
    #else
    @AppStorage("accountNumber") var accountNumber: String = ""
    #endif
    @Published var session: BashiSession? = nil

    public enum State {
        case Idle
        case Recording(bestTranscription: String?)
        case Processing(request: String)
        case Confirm(confirmationMessage: String)
        case Success(result: Value)
        case Error(AppError)
    }

    @Published public private(set) var state: State = .Idle

    public init(accountNumber: String? = nil) {
        logger.info("initializing app state")
        if let an = accountNumber {
            self.accountNumber = an
        }
    }

    private func canTransition(newState: State) -> Bool {
        switch (state, newState)  {
        case (.Idle, .Recording),
             (.Idle, .Processing),
             (.Recording, .Recording),
             (.Recording, .Processing),
             (.Processing, .Processing),
             (.Processing, .Confirm),
             (.Processing, .Success),
             (.Processing, .Idle),
             (.Confirm, .Idle),
             (.Confirm, .Success),
             (.Success, .Idle),
             (.Success, .Recording),
             (.Success, .Processing),
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
            throw AppError.UnexpectedTransition(state, newState)
        }

        return try await closure({ state = newState })
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
