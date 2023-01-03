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
            Text("Hello there")
            Button("One") {
                logger.info("button one tapped")
            }
            Button("Preferences") {
                Task { await controller?.showSettings() }
            }
            Button("Quit") {
                Task { await controller?.quit() }
            }
            Text("Your account number is \(state.accountNumber)")
            if let session = state.session {
                Text("Your session id is \(session.sessionId)")
            }
            
            switch state.state {
            case .Recording(let bestTranscription):
                Text("Recording: " + (bestTranscription ?? ""))
            default:
                Text("blah")
            }
        }
        .padding()
    }
}

struct MenuBarView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView(state: AppState(accountNumber: "123"))
    }
}
