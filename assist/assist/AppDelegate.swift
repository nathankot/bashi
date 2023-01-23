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
    var pluginAPI: PluginAPI!
    var appController: AppController!
    var pluginsController: PluginsController!
    var apiController: APIController!
    var commandsController: CommandsController!

    func applicationDidFinishLaunching(_ aNotification: Notification) {

        popover = NSPopover()
        statusBarItem = NSStatusBar.system.statusItem(withLength: CGFloat(NSStatusItem.variableLength))
        pluginAPI = PluginAPI(state: AppState.shared)
        pluginsController = PluginsController(state: AppState.shared)
        apiController = APIController(pluginsController: pluginsController)
        commandsController = CommandsController(
            pluginAPI: pluginAPI,
            pluginsController: pluginsController,
            apiController: apiController)
        appController = AppController(
            state: AppState.shared,
            popover: popover,
            statusBarItem: statusBarItem,
            commandsController: commandsController,
            pluginsController: pluginsController
        )

        popover.animates = true
        popover.behavior = .transient
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

        #if DEBUG
            if ProcessInfo.processInfo.environment["XCODE_RUNNING_FOR_PREVIEWS"] == "1" ||
                ProcessInfo.processInfo.environment["XCTestConfigurationFilePath"] != nil {
                // Do not run any preparatory tasks when testing or previewing
                return
            }
        #endif

        Task { [weak self] in
            do {
                try await self?.pluginsController.loadBuiltinCommands()
                try await self?.pluginsController.loadCommandsInAppBundle()
                await self?.appController.prepare()
            } catch {
                await self?.appController.state.handleError(AppError.AppLaunchError(error))
            }
        }
    }

    @objc func togglePopover(_ sender: AnyObject?) {
        Task {
            await appController.togglePopover()
        }
    }

}

