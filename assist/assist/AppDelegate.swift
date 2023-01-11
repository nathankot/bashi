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
    var appAPI: AppAPI!
    var appController: AppController!
    var pluginsController: PluginsController!
    var commandsController: CommandsController!
    
    func applicationDidFinishLaunching(_ aNotification: Notification) {
        
        popover = NSPopover()
        statusBarItem = NSStatusBar.system.statusItem(withLength: CGFloat(NSStatusItem.variableLength))
        appAPI = AppAPI(state: AppState.shared, popover: popover, statusBarItem: statusBarItem)
        appController = AppController(state: AppState.shared, pluginAPI: appAPI)
        pluginsController = PluginsController(pluginAPI: appAPI)
        commandsController = CommandsController(pluginAPI: appAPI, pluginsController: pluginsController)
        
        popover.animates = true
        popover.behavior = .applicationDefined
//        popover.contentViewController?.view.superview?.wantsLayer = true
//        popover.contentViewController?.view.superview?.layer?.backgroundColor = .clear
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
                await self?.appController.state.handleError(AppError.AppLaunchError("could not prepare app"))
            }
        }
    }
    
    @objc func togglePopover(_ sender: AnyObject?) {
        Task {
            await appAPI.togglePopover()
        }
    }
    
}

