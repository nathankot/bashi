//
//  PluginsController.swift
//  assist
//
//  Created by Nathan Kot on 6/01/23.
//

import os
import Foundation
import BashiPlugin

actor PluginsController {
    
    enum ErrorType : Error {
        case couldNotLoadPlugin(reason: String)
    }
    
    private let pluginAPI: PluginAPI
    
    private var loadedPluginIds = Set<String>()
    private var plugins: [any Plugin] = []
    
    init(pluginAPI: PluginAPI) {
        self.pluginAPI = pluginAPI
    }
    
    func loadBuiltinCommands() throws {
        guard let builtinCommands = Bundle.main.builtInPlugInsURL?.appendingPathComponent(
            "builtinCommands",
            conformingTo: .pluginBundle) else {
            throw ErrorType.couldNotLoadPlugin(reason: "could not load built in commands - URL not found")
        }
        
        let (pluginId, plugin) = try loadPlugin(fromBundle: builtinCommands)
        if loadedPluginIds.contains(pluginId) {
           throw ErrorType.couldNotLoadPlugin(reason: "plugin loaded more than once: \(pluginId)")
        }
        loadedPluginIds.insert(pluginId)
        plugins.append(plugin)
    }
    
    private func loadPlugin(fromBundle bundlePath: URL) throws -> (pluginId: String, plugin: Plugin) {
        guard let bundle = Bundle.init(url: bundlePath) else {
            throw ErrorType.couldNotLoadPlugin(reason: "could not open url: \(bundlePath.absoluteString)")
        }
        guard let plugin = bundle.principalClass?.makeBashiPlugin(api: pluginAPI) else {
           throw ErrorType.couldNotLoadPlugin(reason: "bundle does not have principal class, or it is invalid: \(bundlePath.absoluteString)")
        }
        guard let pluginId = bundle.principalClass?.id else {
           throw ErrorType.couldNotLoadPlugin(reason: "no plugin id found: \(bundlePath.absoluteString)")
        }
        return (pluginId: pluginId, plugin: plugin)
    }

}
