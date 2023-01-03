//
//  SettingsView.swift
//  assist
//
//  Created by Nathan Kot on 31/12/22.
//

import SwiftUI
import KeyboardShortcuts

struct SettingsView: View {
    @Environment(\.dismiss) private var dismiss
    
    @ObservedObject var state: AppState
    
    init(state s: AppState) {
        self.state = s
    }
    
    func validAccountNumber() -> Bool {
        return state.accountNumber.filter { $0.isNumber } == state.accountNumber
    }

    var body: some View {
        let validAccountNumber = validAccountNumber()
        
        Form {
            Section(content: {
                TextField("Account Number", text: $state.accountNumber)
                if !validAccountNumber {
                    Text("Account number is invalid")
                        .foregroundColor(.red)
                        .font(.caption)
                }
                Button("Create account number") {
                    
                }
            }, header: {
                Text("Authentication")
                    .font(Font.system(.title2))
            })
            .padding(.bottom)
            
            Section {
                KeyboardShortcuts.Recorder("Push to talk", name: .pushToTalk)
                Text("Hold this shortcut key to enable the microphone, release to send the request.")
                    .font(.caption)
            } header: {
                Text("Keyboard Shortcuts")
                    .font(Font.system(.title2))
            }
            .padding(.bottom)
            
            HStack {
                Spacer()
                Button("Close") {
                    dismiss()
                }
            }
        }
        .padding()
        .fixedSize()
    }
}

struct SettingsView_Previews: PreviewProvider {
    static var previews: some View {
        SettingsView(state: AppState(accountNumber: "123456"))
    }
}
