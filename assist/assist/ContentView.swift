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

            Spacer(minLength: 30)
            if state.accountNumber == "" {
                Text("Provide your account number first.").font(.callout).foregroundColor(.gray)
                Button("Open settings", action: showSettings)
                Spacer()
            } else {
                switch state.state {
                case .Idle:
                    if let k = pushToTalkShortcut {
                        Text("Press \(k.description) to start push-to-talk").font(.callout).foregroundColor(.gray)
                    } else {
                        Text("Set up a shortcut key for push-to-talk").font(.callout).foregroundColor(.gray)
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
                        requestTextfieldValue = ""
                    }
                case .AwaitingRequest:
                    let s = state.currentTranscription ?? ""
                    MessageListView(messages: [
                        .init(id: 0, message: s + " ...", type: .transcribing)
                    ])
                    Spacer()
                    if let k = pushToTalkShortcut {
                        Text("Press \(k.description) again to finish talking")
                            .font(.callout)
                            .foregroundColor(.gray)
                    }
                    Button("Cancel", action: cancelRequest)
                case let .Processing(messages):
                    MessageListView(messages: messages)
                    Text("Processing...").font(.callout).foregroundColor(.gray)
                case let .NeedsInput(messages: messages, type: .Question(onAnswer)):
                    if let s = state.currentTranscription {
                        MessageListView(messages: messages + [
                            .init(id: messages.count, message: s + " ...", type: .transcribing)
                        ])
                        Spacer()
                        if let k = pushToTalkShortcut {
                            Text("Press \(k.description) again to finish talking")
                                .font(.callout)
                                .foregroundColor(.gray)
                        }
                    } else {
                        MessageListView(messages: messages)
                        Spacer()
                        HStack {
                            TextField("Enter response", text: $requestTextfieldValue)
                                .focused($requestTextFieldFocus)
                                .onChange(of: requestTextFieldFocus, perform: { v in
                                    state.update(requestTextFieldFocus: v)
                                }).onReceive(state.$isRequestTextFieldFocused) { v in
                                    self.requestTextFieldFocus = v
                                }.onSubmit {
                                    onAnswer(requestTextfieldValue)
                                    requestTextfieldValue = ""
                                }
                            Button("Cancel", action: cancelRequest)
                        }
                        if let k = pushToTalkShortcut {
                            Text("Press \(k.description) to speak or copy some text to use it as the response")
                                .font(.callout)
                                .foregroundColor(.gray)
                        }
                    }
                case .Finished(let messages):
                    MessageListView(messages: messages)
                    Spacer(minLength: 20)
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
            .frame(maxWidth: 300, minHeight: 300, maxHeight: 483)
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

struct MessageListView: View {
    let messages: [Message]
    var body: some View {
        ScrollViewReader { proxy in
            ScrollView(.vertical, showsIndicators: false) {
                VStack(alignment: .leading) {
                    ForEach(messages) {
                        MessageView(message: $0).id($0.id)
                    }
                }
                .onAppear { proxy.scrollTo(messages.last?.id, anchor: .bottom) }
                .onChange(of: messages.count, perform: { _ in proxy.scrollTo(messages.last?.id)})
            }
        }
        .frame(maxHeight: .infinity)
    }
}

struct MessageView: View {
    let message: Message
    var body: some View {
        HStack {
            Text(message.message)
                .frame(maxWidth: .infinity, alignment: .leading)
                .foregroundColor(message.type == .transcribing ? .gray : .white)
                .italic(message.type == .transcribing)
                .textSelection(.enabled)
        }
            .padding()
            .background(message.type == .modelResponse
                ? .purple
            : .black)
            .cornerRadius(6)
    }
}


struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView(state: AppState(accountNumber: ""))
            .previewDisplayName("Needs account number")
        ContentView(state: AppState(accountNumber: "123"))
            .previewDisplayName("Idle")
        ContentView(state: AppState(accountNumber: "123", state: .AwaitingRequest))
            .previewDisplayName("Awaiting Request")
        ContentView(state: AppState(accountNumber: "123", state: .AwaitingRequest, currentTranscription: "some transcription"))
            .previewDisplayName("Awaiting Request - transcribing")
        ContentView(state: AppState(
            accountNumber: "123",
            state: .Processing(messages: [
                .init(id: 0, message: "please help me", type: .request)
            ])))
        .previewDisplayName("Processing initial request")
        ContentView(state: AppState(
            accountNumber: "123",
            state: .NeedsInput(messages: [
                .init(id: 0, message: "please help me", type: .request),
                .init(id: 1, message: "provide the text input", type: .modelResponse)
            ], type: .Question(onAnswer: { _ in }))))
        .previewDisplayName("Needs text input")
        ContentView(state: AppState(
            accountNumber: "123",
            state: .NeedsInput(messages: [
                .init(id: 0, message: "please help me", type: .request),
                .init(id: 1, message: "provide the text input", type: .modelResponse)
            ], type: .Question(onAnswer: { _ in })),
            currentTranscription: "some answer being transcribed"
        ))
        .previewDisplayName("Needs text input - transcribing")
        ContentView(state: AppState(
            accountNumber: "123",
            state: .Finished(messages: [
                .init(id: 0, message: "please help me", type: .request),
                .init(id: 1, message: "please provide some input", type: .modelResponse),
                .init(id: 2, message: "okay here is input A Nullam ullamcorper auctor sapien, nec vulputate nisl aliquam non. Nam nec mauris nulla. Proin tempor, lacus sit amet condimentum sollicitudin, ligula ligula sodales dui, vel faucibus tellus nibh egestas turpis.", type: .userResponse),
                .init(id: 3, message: "please provide some content", type: .modelResponse),
                .init(id: 4, message: "The result has been copied to your clipboard", type: .sideEffectResult)
            ])
        ))
        .previewDisplayName("Finished")
    }
}

