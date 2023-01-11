//
//  AppAPI.swift
//  assist
//
//  Created by Nathan Kot on 11/01/23.
//

import Foundation
import Cocoa
import BashiPlugin

@MainActor
class AppAPI : PluginAPI {
    
    let state: AppState
    let popover: NSPopover
    let statusBarItem: NSStatusItem
    
    init(state: AppState, popover: NSPopover, statusBarItem: NSStatusItem) {
        self.state = state
        self.popover = popover
        self.statusBarItem = statusBarItem
    }
    
    func quit() async {
        await MainActor.run {
            NSApplication.shared.terminate(nil)
        }
    }
    
    func showSettings() async {
        await MainActor.run {
            popover.performClose(nil)
            NSApp.sendAction(Selector(("showSettingsWindow:")), to: nil, from: nil)
        }
    }
    
    func togglePopover(shouldShow: Bool? = nil) {
        let isCurrentlyShown = self.popover.isShown
        let shouldShow = shouldShow ?? !isCurrentlyShown
        
        if !shouldShow {
            self.popover.performClose(nil)
        } else {
            if let button = self.statusBarItem.button {
                self.popover.show(relativeTo: button.bounds, of: button, preferredEdge: NSRectEdge.minY)
                self.popover.contentViewController?.view.window?.becomeKey()
            }
        }
    }
    
    func displayResult(text: String) async {
        logger.log("displayed result is: \(text)")
    }
    
}
