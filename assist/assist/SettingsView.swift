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
    @State var accountNumber = ""
    @State var accountNumberInvalid = false
    @State var isSaving = false

    var overrideAccountNumberInvalid = false

    init(state s: AppState, overrideAccountNumberInvalid: Bool = false) {
        self.state = s
        self.overrideAccountNumberInvalid = overrideAccountNumberInvalid
        self.accountNumber = state.accountNumber
    }

    var body: some View {
        Form {
            Spacer(minLength: 30)

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

        // Verify the account number:
        if accountNumber == "" {
            accountNumberInvalid = true
            return
        }
        if accountNumber != state.accountNumber {
            let apiClient = APIClient(baseURL: BashiClient.Server.main, defaultHeaders: [
                "Authorization": "Bearer \(accountNumber)"])
            let request = BashiClient.PostSessions.Request(
                body: .init(modelConfigurations: .init())
            )
            let response = await withCheckedContinuation { continuation in
                apiClient.makeRequest(request, complete: { response in
                    continuation.resume(returning: response)
                })
            }
            switch try? response.result.get() {
            case .status401, .status403:
                accountNumberInvalid = true
                return
            default:
                break
            }
        }

        accountNumberInvalid = false
        state.accountNumber = accountNumber
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

