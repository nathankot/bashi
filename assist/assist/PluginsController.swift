//
//  PluginsController.swift
//  assist
//
//  Created by Nathan Kot on 6/01/23.
//

import os
import Foundation
import BashiPlugin

public actor PluginsController {
    
    enum PluginError : Error {
        case couldNotLoadPlugin(reason: String, error: Error? = nil)
        case commandLoadedTwice(commandName: String)
    }
    
    private let pluginAPI: PluginAPI
    
    private var plugins: Dictionary<String, any Plugin> = [:]
    private var commandDefinitions: Dictionary<String, any Command> = [:]
    
    public init(pluginAPI: PluginAPI) {
        self.pluginAPI = pluginAPI
    }
    
    public func lookup(command: String) -> Command? {
        return commandDefinitions[command]
    }
    
    internal func loadBuiltinCommands() async throws {
        guard let builtinCommands = Bundle.main.builtInPlugInsURL?.appendingPathComponent(
            "builtinCommands",
            conformingTo: .pluginBundle) else {
            throw PluginError.couldNotLoadPlugin(reason: "could not load built in commands - URL not found")
        }
        
        try await loadPlugin(fromBundle: builtinCommands)
    }
    
    internal func loadPlugin(fromBundle bundlePath: URL) async throws {
        guard let bundle = Bundle.init(url: bundlePath) else {
            throw PluginError.couldNotLoadPlugin(reason: "could not open url: \(bundlePath.absoluteString)")
        }
        guard let plugin = bundle.principalClass?.makeBashiPlugin(api: pluginAPI) else {
           throw PluginError.couldNotLoadPlugin(reason: "bundle does not have principal class, or it is invalid: \(bundlePath.absoluteString)")
        }
        guard let pluginId = bundle.principalClass?.id else {
           throw PluginError.couldNotLoadPlugin(reason: "no plugin id found: \(bundlePath.absoluteString)")
        }
        try await loadPlugin(plugin, withId: pluginId)
    }
    
    public func loadPlugin(_ plugin: Plugin, withId pluginId: String) async throws {
        do {
            try await plugin.prepare()
        } catch {
            throw PluginError.couldNotLoadPlugin(reason: "plugin preparation failed", error: error)
        }
        if plugins[pluginId] != nil {
           throw PluginError.couldNotLoadPlugin(reason: "plugin loaded more than once: \(pluginId)")
        }
        plugins[pluginId] = plugin
        
        for c in plugin.provideCommands() {
            if commandDefinitions[c.name] != nil {
                throw PluginError.commandLoadedTwice(commandName: c.name)
            }
            commandDefinitions[c.name] = c
        }
    }

}
