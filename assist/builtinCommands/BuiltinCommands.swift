//
//  BuiltinCommands.swift
//  builtinCommands
//
//  Created by Nathan Kot on 6/01/23.
//

import Foundation
import BashiPlugin
import BashiClient

class BuiltinCommands : Plugin {
    static var id: String = "built_in_commands"
    static func makeBashiPlugin(api: PluginAPI) -> Plugin {
        return BuiltinCommands()
    }
    
    func provideCommands() -> [BashiPlugin.Command] {
        return [
        ]
    }
}

public class AnonymousCommandContext: CommandContext {
    public var requestContextStrings: Dictionary<String, String> = [:]
    public var requestContextNumbers: Dictionary<String, Double> = [:]
    public var requestContextBooleans: Dictionary<String, Bool> = [:]
    public var stringResult: String? = nil
    
    public static func from(requestContext: RequestContext) -> AnonymousCommandContext {
        let ctx = AnonymousCommandContext()
        
        for (name, value) in requestContext.additionalProperties {
            switch value {
            case .stringValue(let v):
                ctx.requestContextStrings.updateValue(v.value, forKey: name)
            case .numberValue(let v):
                ctx.requestContextNumbers.updateValue(v.value, forKey: name)
            case .booleanValue(let v):
                ctx.requestContextBooleans.updateValue(v.value, forKey: name)
            default:
                continue
            }
        }
        
        // Use reflection, the goal is that any new well-known context
        // fields are supported even without bumping the client library
        // version (TODO: verify this)
        let mirror = Mirror(reflecting: requestContext)
        for attr in mirror.children {
            guard let label = attr.label else { continue }
            switch attr.value {
            case let v as StringValue:
                ctx.requestContextStrings.updateValue(v.value, forKey: label)
            case let v as NumberValue:
                ctx.requestContextNumbers.updateValue(v.value, forKey: label)
            case let v as BooleanValue:
                ctx.requestContextBooleans.updateValue(v.value, forKey: label)
            default:
                continue
            }
        }
        
        
        return ctx
    }
}

public class AnonymousPreparedCommand : PreparedCommand {
    public let shouldSkipConfirmation: Bool
    public let confirmationMessage: String
    private let runFn: (PluginAPI, CommandContext) async throws -> CommandContext
    
    init(
        shouldSkipConfirmation: Bool,
        confirmationMessage: String,
        runFn: @escaping (PluginAPI, CommandContext) async throws -> CommandContext
    ) {
        self.shouldSkipConfirmation = shouldSkipConfirmation
        self.confirmationMessage = confirmationMessage
        self.runFn = runFn
        
    }
    
    public func run(api: PluginAPI, context: CommandContext) async throws -> CommandContext {
        return try await runFn(api, context)
    }
}

public class AnonymousCommand : BashiPlugin.Command {
    public let name: String
    private let shouldRunBeforeFn: (BashiPlugin.Command) -> Bool
    private let prepareFn: (PluginAPI, CommandContext) -> PreparedCommand?
    
    init(name: String,
         shouldRunBeforeFn: @escaping (BashiPlugin.Command) -> Bool = { _ in false },
         prepareFn: @escaping (PluginAPI, CommandContext) -> PreparedCommand?) {
        self.name = name
        self.shouldRunBeforeFn = shouldRunBeforeFn
        self.prepareFn = prepareFn
    }
    
    public func shouldRunBefore(otherCommand: BashiPlugin.Command) -> Bool {
        return shouldRunBeforeFn(otherCommand)
        
    }
    
    public func prepare(api: PluginAPI, context: CommandContext) -> PreparedCommand? {
        return prepareFn(api, context)
    }
}
