//
//  PluginAPI.swift
//  assist
//
//  Created by Nathan Kot on 11/01/23.
//

import Foundation
import Cocoa
import BashiPlugin

@MainActor
class PluginAPI : BashiPluginAPI {
    
    let state: AppState
    
    init(state: AppState) {
        self.state = state
    }
    
    func flush(message: String) async {
        logger.log("displayed result is: \(message)")
    }
}
