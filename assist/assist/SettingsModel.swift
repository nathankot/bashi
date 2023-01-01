//
//  SettingsModel.swift
//  assist
//
//  Created by Nathan Kot on 31/12/22.
//

import Foundation
import SwiftUI

class SettingsModel : ObservableObject {
    var accountNumber: String
    
    init(accountNumber: String) {
        self.accountNumber = accountNumber
    }
}
