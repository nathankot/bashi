//
//  ContentView.swift
//  assist
//
//  Created by Nathan Kot on 2/01/23.
//

import os
import SwiftUI

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

            Spacer()
            if state.accountNumber == "" {
                Text("Provide your account number first.")
                    .font(.callout)
                Button("Open settings", action: showSettings)
            } else {
                switch state.state {
                case .Idle:
                    Text("Idle")
                default:
                    Text("Unsupported state: \(String(reflecting: state.state))")
                }
            }
            Spacer()
        }
            .padding()
            .frame(minHeight: 200)
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

