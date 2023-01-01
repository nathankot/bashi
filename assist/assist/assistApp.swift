//
//  assistApp.swift
//  assist
//
//  Created by Nathan Kot on 31/12/22.
//

import SwiftUI

@main
struct assistApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        Settings {
            SettingsView(settings: SettingsModel(accountNumber: "123"))
        }
    }
}
