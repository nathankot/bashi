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

#if DEBUG
import AlamofireNetworkActivityLogger
#endif

class AppDelegate: NSObject, NSApplicationDelegate {
    var popover: NSPopover!
    var statusBarItem: NSStatusItem!
    var appController: AppController!
    
    func applicationDidFinishLaunching(_ aNotification: Notification) {
        #if DEBUG
        NetworkActivityLogger.shared.startLogging()
        #endif
        
        let popover = NSPopover()
//        popover.contentSize = NSSize(width: 400, height: 400)
        popover.behavior = .transient
        self.popover = popover
        self.appController = AppController(state: AppState.shared, popover: popover)
        
        let menuBarView = MenuBarView(state: AppState.shared, controller: appController)
        popover.contentViewController = NSHostingController(rootView: menuBarView)
        
        // Create the status item
        self.statusBarItem = NSStatusBar.system.statusItem(withLength: CGFloat(NSStatusItem.variableLength))
        
        if let button = self.statusBarItem.button {
            button.image = NSImage(systemSymbolName: "heart", accessibilityDescription: "assist")
            button.action = #selector(togglePopover(_:))
        }
        
        
        Task { [weak self] in
            await self?.appController.prepare()
            await self?.appController.listenToKeyboardShortcuts()
        }
    }
    
    @objc func togglePopover(_ sender: AnyObject?) {
        if let button = self.statusBarItem.button {
            if self.popover.isShown {
                self.popover.performClose(sender)
            } else {
                self.popover.show(relativeTo: button.bounds, of: button, preferredEdge: NSRectEdge.minY)
                self.popover.contentViewController?.view.window?.becomeKey()
            }
        }
    }
    
}

