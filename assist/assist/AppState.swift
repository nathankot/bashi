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
    
    indirect enum ErrorType : Error, Equatable {
        case Unexpected(String)
        case UnexpectedTransition(State, State)
    }
    
    enum State : Equatable {
        case Idle
        case Recording(bestTranscription: String?)
        case Error(ErrorType)
    }
    
    @Published var state: State = .Idle
    
    convenience init() {
        logger.info("initializing app state")
        self.init(accountNumber: "")
    }
    
    init(accountNumber: String) {
        self.accountNumber = accountNumber
    }
    
    func canTransition(newState: State) -> Bool {
        switch (state, newState)  {
        case (.Idle, .Recording),
             (.Recording, .Recording),
             (.Error, .Idle),
             (.Error, .Recording),
             (_, .Error):
            return true
        default:
            return false
        }
    }
   
    func transition<R>(newState: State, doBeforeTransition: () async throws -> R) async throws -> R {
        if canTransition(newState: newState) {
            let r = try await doBeforeTransition()
            state = newState
            return r
        } else {
            logger.error("unexpected transition from \(String(reflecting: state)) to \(String(reflecting: newState))")
            throw ErrorType.UnexpectedTransition(state, newState)
        }
    }
}

