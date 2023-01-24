//
//  ContentView.swift
//  assist
//
//  Created by Nathan Kot on 2/01/23.
//

import os
import SwiftUI
import KeyboardShortcuts

struct ContentView: View {
    @ObservedObject var state: AppState
    var controller: AppController?

    var body: some View {
        VStack {
            HStack {
                Text("Assist")
                    .frame(minWidth: 200, alignment: .leading)
                Spacer()
                Menu {
                    Button("Preferences", action: showSettings)
                    Button("Quit", action: quit)
                } label: {
                    Spacer()
                    Label("Settings", systemImage: "gear")
                        .labelStyle(.iconOnly)
                }
                    .menuStyle(.borderlessButton)
                    .frame(maxWidth: 30)
            }

            let pushToTalkShortcut = KeyboardShortcuts.getShortcut(for: .pushToTalk)

            Spacer()
            if state.accountNumber == "" {
                Text("Provide your account number first.").font(.callout)
                Button("Open settings", action: showSettings)
            } else {
                switch state.state {
                case .Idle:
                    if let k = pushToTalkShortcut {
                        Text("Hold \(k.description) to push-to-talk").font(.callout)
                    } else {
                        Text("Set up a shortcut key for push-to-talk").font(.callout)
                        Button("Open settings", action: showSettings)
                    }
                case .Recording(bestTranscription: let s):
                    Text("Listening...").font(.callout)
                    Text(s ?? "")
                case .Processing(let messages):
                    Text("Request:").font(.callout)
                    List(messages) {
                        Text($0.message)
                    }
                    Text("Processing...").font(.callout)
                case .Finished(let messages):
                    List(messages) {
                        Text($0.message)
                    }
                    Button("Done", action: dismissError)
                case .Error(let e):
                    switch e {
                    default:
                        Text("Unexpected error. Please try again.")
                    }
                    Button("Dismiss", action: dismissError)
                default:
                    Text("Unsupported state: \(String(reflecting: state.state))")
                }
            }
            Spacer()
        }
            .padding()
            .frame(maxWidth: 300, minHeight: 200)
    }

    func dismissError() {
        Task { await controller?.dismissError() }
    }
    
    func showSettings() {
        Task { await controller?.showSettings() }
    }

    func quit() {
        Task { await controller?.quit() }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView(state: AppState(accountNumber: ""))
            .previewDisplayName("Needs account number")
        ContentView(state: AppState(accountNumber: "123"))
            .previewDisplayName("Idle")
    }
}

