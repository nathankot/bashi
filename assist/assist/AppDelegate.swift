//
//  AppDelegate.swift
//  assist
//
//  Created by Nathan Kot on 2/01/23.
//

import AppKit
import Foundation
import Cocoa
import SwiftUI

class AppDelegate: NSObject, NSApplicationDelegate {
    var popover: NSPopover!
    var statusBarItem: NSStatusItem!
    var appController: AppController!
    
    func applicationDidFinishLaunching(_ aNotification: Notification) {
        
        let statusBarItem = NSStatusBar.system.statusItem(withLength: CGFloat(NSStatusItem.variableLength))
        self.statusBarItem = statusBarItem
        if let button = self.statusBarItem.button {
            button.image = NSImage(systemSymbolName: "heart", accessibilityDescription: "assist")
            button.action = #selector(togglePopover(_:))
        }
        
        let popover = NSPopover()
        popover.animates = true
        popover.behavior = .applicationDefined
        self.popover = popover
        self.appController = AppController(state: AppState.shared, popover: popover, statusBarItem: statusBarItem)
       
        let contentView = ContentView(state: AppState.shared, controller: appController)
        let hostingController = NSHostingController(rootView: contentView)
        if #available(macOS 13, *) {
            hostingController.sizingOptions = .preferredContentSize
        }
        
        popover.contentViewController = hostingController

        Task { [weak self] in
            await self?.appController.prepare()
        }
    }
    
    @objc func togglePopover(_ sender: AnyObject?) {
        Task {
            await appController.togglePopover()
        }
    }
    
}

