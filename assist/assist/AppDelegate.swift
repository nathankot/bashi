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
    var pluginsController: PluginsController!
    var appController: AppController!
    
    func applicationDidFinishLaunching(_ aNotification: Notification) {
        
        popover = NSPopover()
        statusBarItem = NSStatusBar.system.statusItem(withLength: CGFloat(NSStatusItem.variableLength))
        appController = AppController(state: AppState.shared, popover: popover, statusBarItem: statusBarItem)
        pluginsController = PluginsController(pluginAPI: appController)
        
        popover.animates = true
        popover.behavior = .applicationDefined
        if let button = self.statusBarItem.button {
            button.image = NSImage(systemSymbolName: "heart", accessibilityDescription: "assist")
            button.action = #selector(togglePopover(_:))
        }
        
        let contentView = ContentView(state: AppState.shared, controller: appController)
        let hostingController = NSHostingController(rootView: contentView)
        if #available(macOS 13, *) {
            hostingController.sizingOptions = .preferredContentSize
        }
        
        popover.contentViewController = hostingController

        Task { [weak self] in
            do {
                try await self?.pluginsController.loadBuiltinCommands()
                await self?.appController.prepare()
            } catch {
                await self?.appController.state.handleError(AppState.ErrorType.AppLaunchError("could not prepare app"))
            }
        }
    }
    
    @objc func togglePopover(_ sender: AnyObject?) {
        Task {
            await appController.togglePopover()
        }
    }
    
}

