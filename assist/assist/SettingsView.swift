//
//  SettingsView.swift
//  assist
//
//  Created by Nathan Kot on 31/12/22.
//

import SwiftUI

struct SettingsView: View {
    @ObservedObject var settings: SettingsModel
    
    var body: some View {
        Form {
            Section {
                TextField("Account Number", text: $settings.accountNumber)
            } header: {
                Text("Authentication")
                    .font(Font.system(.title2))
            }
            Spacer()
        }
        .padding(.all)
    }
}

struct SettingsView_Previews: PreviewProvider {
    static var previews: some View {
        SettingsView(settings: SettingsModel(accountNumber: "123456"))
    }
}
