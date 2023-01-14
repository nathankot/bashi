//
//  PluginsController.swift
//  assist
//
//  Created by Nathan Kot on 6/01/23.
//

import os
import Foundation
import BashiPlugin
import class BashiClient.CommandDefinition
import enum BashiClient.ValueType
import enum BashiClient.ArgumentParser

let BUILTIN_COMMANDS_PLUGIN_ID = "builtinCommands"

public actor PluginsController {
    
    enum PluginError : Error {
        case couldNotLoadPlugin(reason: String, error: Error? = nil)
        case commandLoadedTwice(commandName: String)
    }
    
    private let state: AppState = AppState.shared
    private let pluginAPI: PluginAPI
    
    private var plugins: Dictionary<String, any Plugin> = [:]
    public private(set) var commandDefinitions: Dictionary<String, (pluginId: String, def: any Command)> = [:]
    
    public init(pluginAPI: PluginAPI) {
        self.pluginAPI = pluginAPI
    }
    
    public func lookup(command: String) -> Command? {
        return commandDefinitions[command]?.def
    }
    
    internal func loadBuiltinPlugins() async throws {
        guard let url = Bundle.main.builtInPlugInsURL else {
            throw PluginError.couldNotLoadPlugin(reason: "no plugins url found")
        }
        for f in try FileManager.default.contentsOfDirectory(atPath: url.path) {
            if f.hasSuffix(".plugin") {
                try await loadPlugin(fromBundle: url.appendingPathComponent(f))
            }
        }
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
            commandDefinitions[c.name] = (pluginId: pluginId, def: c)
        }
    }

}

extension CommandArgType {
    func toAPIRepresentation() -> ValueType {
        switch self {
        case .string: return .string
        case .boolean: return .boolean
        case .number: return .number
        }
    }
}

extension CommandArgParser {
    func toAPIRepresentation() -> ArgumentParser {
        switch self {
        case .naturalLanguageDateTime: return .naturalLanguageDateTime
        }
    }
}

extension Command {
    func toAPIRepresentation() -> BashiClient.CommandDefinition {
        return .init(
            description: self.description,
            args: self.args.map {
                .init(
                    name: $0.name,
                    type: $0.type.toAPIRepresentation(),
                    parse: $0.parsers.map { $0.toAPIRepresentation() }
                )
            },
            triggerTokens: self.triggerTokens
        )
    }
}
