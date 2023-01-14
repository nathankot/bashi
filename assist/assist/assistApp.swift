//
//  AssistApp.swift
//  assist
//
//  Created by Nathan Kot on 31/12/22.
//

import os
import SwiftUI
import BashiClient

let logger = Logger()

@main
struct AssistApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) var delegate

    @StateObject private var state: AppState = AppState.shared

    var body: some Scene {
        Settings {
            SettingsView(state: state)
        }
        // Menubar view is managed by AppDelegate.
    }
}
