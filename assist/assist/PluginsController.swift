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

let BUILTIN_COMMANDS_PLUGIN_ID = "builtinCommands"

public actor PluginsController {
    
    enum PluginError : Error {
        case couldNotLoadPlugin(reason: String, error: Error? = nil)
        case commandLoadedTwice(commandName: String)
    }
    
    private let state: AppState
    
    private var plugins: Dictionary<String, any BashiPluginProtocol> = [:]
    public private(set) var commandDefinitions: Dictionary<String, (pluginId: String, def: any Command)> = [:]
    
    public init(state: AppState) {
        self.state = state
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
                do {
                    try await loadPlugin(fromBundle: url.appendingPathComponent(f))
                } catch {
                    if f.hasSuffix(BUILTIN_COMMANDS_PLUGIN_ID + ".plugin") {
                        throw error
                    }
                    logger.error("could not load plugin at: \(url.path)")
                }
            }
        }
    }
    
    internal func loadPlugin(fromBundle bundlePath: URL) async throws {
        guard let bundle = Bundle.init(url: bundlePath) else {
            throw PluginError.couldNotLoadPlugin(reason: "could not open url: \(bundlePath.absoluteString)")
        }
        guard let plugin = bundle.principalClass?.makeBashiPlugin() else {
           throw PluginError.couldNotLoadPlugin(reason: "bundle does not have principal class, or it is invalid: \(bundlePath.absoluteString)")
        }
        guard let pluginId = bundle.principalClass?.id else {
           throw PluginError.couldNotLoadPlugin(reason: "no plugin id found: \(bundlePath.absoluteString)")
        }
        try await loadPlugin(plugin, withId: pluginId)
    }
    
    public func loadPlugin(_ plugin: BashiPluginProtocol, withId pluginId: String) async throws {
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

extension BashiValueType {
    func toAPIRepresentation() -> ValueType {
        switch self {
        case .string: return .string
        case .boolean: return .boolean
        case .number: return .number
        case .void: return .void
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
                    type: $0.type.toAPIRepresentation()
                )
            },
            returnType: self.returnType.toAPIRepresentation(),
            triggerTokens: self.triggerTokens
        )
    }
}
