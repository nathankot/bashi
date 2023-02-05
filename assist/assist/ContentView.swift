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
    @State private var requestTextfieldValue: String = ""
    @FocusState private var requestTextFieldFocus: Bool

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
                Spacer()
            } else {
                switch state.state {
                case .Idle:
                    if let k = pushToTalkShortcut {
                        Text("Press \(k.description) to push-to-talk").font(.callout)
                    } else {
                        Text("Set up a shortcut key for push-to-talk").font(.callout)
                        Button("Open settings", action: showSettings)
                    }
                    Spacer()
                    TextField("Enter request", text: $requestTextfieldValue)
                        .focused($requestTextFieldFocus)
                        .onChange(of: requestTextFieldFocus, perform: { v in
                            state.update(requestTextFieldFocus: v)
                        })
                        .onReceive(state.$isRequestTextFieldFocused, perform: { v in
                            self.requestTextFieldFocus = v
                        })
                        .onSubmit {
                            controller?.makeRequest(requestTextfieldValue)
                        }
                case .AwaitingRequest:
                    Text("Listening...").font(.callout)
                    if let s = state.currentTranscription {
                        Text(s)
                    }
                    if let k = pushToTalkShortcut {
                        Text("Press \(k.description) again to finish talking").font(.callout)
                    }
                    Spacer()
                    Button("Cancel", action: cancelRequest)
                case let .Processing(messages):
                    Text("Request:").font(.callout)
                    List(messages) {
                        Text($0.message)
                    }
                    Text("Processing...").font(.callout)
                case let .NeedsInput(messages: messages, type: .Question(question, _)):
                    List(messages) {
                        Text($0.message)
                    }
                    Text(question)
                    if let s = state.currentTranscription {
                        Text(s)
                        if let k = pushToTalkShortcut {
                            Text("Press \(k.description) again to finish talking").font(.callout)
                        }
                    } else {
                        if let k = pushToTalkShortcut {
                            Text("Press \(k.description) to respond").font(.callout)
                        }
                    }
                    Spacer()
                    Button("Cancel", action: cancelRequest)
                case .NeedsInput(messages: _, type: .RequestContextText(description: let desc, onReceive: _)):
                    Text("Context required, please copy the text that matches the following requirement:")
                    Text(desc)
                    Button("Cancel", action: cancelRequest)
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
                    Spacer()
                default:
                    Text("Unsupported state: \(String(reflecting: state.state))")
                }

            }
        }
            .padding()
            .frame(maxWidth: 300, minHeight: 200)
    }

    func cancelRequest() {
        Task { await controller?.cancelRequest() }
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

