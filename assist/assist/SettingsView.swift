//
//  SettingsView.swift
//  assist
//
//  Created by Nathan Kot on 31/12/22.
//

import BashiClient
import Combine
import SwiftUI
import KeyboardShortcuts

struct SettingsView: View {
    @Environment(\.dismiss) private var dismiss

    @ObservedObject var state: AppState
    @State var accountNumberInvalid = false
    @State var apiBaseURL: String = ""
    @State var isSaving = false

    var overrideAccountNumberInvalid = false

    init(state s: AppState, overrideAccountNumberInvalid: Bool = false) {
        self.state = s
        self.overrideAccountNumberInvalid = overrideAccountNumberInvalid
    }

    var body: some View {
        Form {
            Spacer(minLength: 30)
            
            TextField("API base URL", text: $apiBaseURL)
                .onAppear { self.apiBaseURL = state.apiBaseURL }
                .onChange(of: state.apiBaseURL) { self.apiBaseURL = $0 }
            Text("Defaults to " + BashiClient.Server.main)
                .font(.caption)

            KeyboardShortcuts.Recorder("Push to talk", name: .pushToTalk)
            Text("Use this shortcut to enable the microphone, tap again to send the request.")
                .font(.caption)
            
            KeyboardShortcuts.Recorder("Focus on request textbox", name: .focusTextEntry)
            Text("Use this shortcut to type a request.")
                .font(.caption)

            Spacer(minLength: 30)
            
            HStack {
                Button("Save") {
                    Task {
                        await save()
                        dismiss()
                    }
                }
                Button("Cancel", role: .cancel) {
                    dismiss()
                }
            }
        }
            .disabled(isSaving)
            .padding()
            .fixedSize()
    }

    func save() async {
        isSaving = true
        defer { isSaving = false }
        state.apiBaseURL = apiBaseURL
        dismiss()
    }
}

struct SettingsView_Previews: PreviewProvider {
    static var previews: some View {
        let state = AppState(accountNumber: "123456")
        SettingsView(state: state)
        SettingsView(state: state, overrideAccountNumberInvalid: true)
            .previewDisplayName("invalid account number")
    }
}

