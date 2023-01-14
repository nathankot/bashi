//
//  CommandsController.swift
//  assist
//
//  Created by Nathan Kot on 9/01/23.
//

import Foundation
import BashiClient
import BashiPlugin

public actor CommandsController {

    public enum CommandError: Error {
        case commandInvalid(CommandInvalid.InvalidReason)
        case commandParseError(String)
        case commandNotFound(String)
        case commandNotConfirmed(latestCommandContext: CommandContext)
        case mismatchArgs(String)
    }

    let pluginAPI: PluginAPI
    let pluginsController: PluginsController

    public init(pluginAPI: PluginAPI, pluginsController: PluginsController) {
        self.pluginAPI = pluginAPI
        self.pluginsController = pluginsController
    }

    public func handle(
        assistResponse: ModelsAssist000Output,
        commandContext: CommandContext,
        onUpdatedContext: Optional<(CommandContext) async throws -> Void> = nil,
        confirmationHandler: (String) async -> Bool
    ) async throws -> CommandContext {
        if let missingRequestContext = assistResponse.missingRequestContext {
            throw AppError.Internal("fulfillment of missing request context not yet implemented: \(missingRequestContext)")
        }

        var updateCommandContext = true

        for command in assistResponse.commands {
            if updateCommandContext {
                updateCommandContext = false
                try await onUpdatedContext?(commandContext)
            }

            switch command {
            case .commandInvalid(let c):
                await commandContext.append(error: CommandError.commandInvalid(c.invalidReason))
            case .commandParseError(let c):
                await commandContext.append(error: CommandError.commandParseError(c.error))
            case .commandExecuted(let c):
                updateCommandContext = true
                switch c.returnValue {
                case .stringValue(let v):
                    await commandContext.append(
                        returnValue: CommandValue(.string(v.value)))
                case .numberValue(let v):
                    await commandContext.append(
                        returnValue: CommandValue(.number(v.value)))
                case .booleanValue(let v):
                    await commandContext.append(
                        returnValue: CommandValue(.boolean(v.value)))
                }
            case .commandParsed(let c):
                updateCommandContext = true
                guard let commandDef = await pluginsController.lookup(command: c.name) else {
                    await commandContext.append(error: CommandError.commandNotFound(c.name))
                    continue
                }
                let args = c.args.map { CommandValue.init(from: $0) }
                if commandDef.args.count != args.count {
                    throw CommandError.mismatchArgs("command expects \(commandDef.args.count) args but got \(args.count)")
                }
                let invalidArgs = zip(commandDef.args, args).filter({ $0.type != $1.type })
                if invalidArgs.count > 0 {
                    let name = invalidArgs.first?.0.name ?? "<unknown>"
                    let type = invalidArgs.first?.0.type.asString() ?? "<unknown>"
                    throw CommandError.mismatchArgs("the argument '\(name)' expects a \(type)")
                }

                guard let prepared = commandDef.prepare(
                    api: pluginAPI,
                    context: commandContext,
                    args: args
                ) else {
                    continue
                }
                if !prepared.shouldSkipConfirmation {
                    let confirmed = await confirmationHandler(prepared.confirmationMessage)
                    if !confirmed {
                        throw CommandError.commandNotConfirmed(latestCommandContext: commandContext)
                    }
                }

                try await prepared.run()
            }
        }

        return commandContext
    }

}

public actor CommandContext: BashiPlugin.CommandContext {

    enum ReturnValue {
        case commandValue(CommandValue)
        case action(CommandBuiltinAction)
    }

    nonisolated public let request: String
    nonisolated public let requestContextStrings: Dictionary<String, String>
    nonisolated public let requestContextNumbers: Dictionary<String, Double>
    nonisolated public let requestContextBooleans: Dictionary<String, Bool>

    private var _returnValues: [ReturnValue] = []
    private var errors: [Error] = []

    public static func from(request: String, requestContext: RequestContext) -> CommandContext {
        var requestContextStrings: Dictionary<String, String> = [:]
        var requestContextNumbers: Dictionary<String, Double> = [:]
        var requestContextBooleans: Dictionary<String, Bool> = [:]

        for (name, value) in requestContext.additionalProperties {
            switch value {
            case .stringValue(let v):
                requestContextStrings.updateValue(v.value, forKey: name)
            case .numberValue(let v):
                requestContextNumbers.updateValue(v.value, forKey: name)
            case .booleanValue(let v):
                requestContextBooleans.updateValue(v.value, forKey: name)
            }
        }

        // Use reflection, this ensures that the following does not need
        // to be updated when new well-known request context values are added.
        let mirror = Mirror(reflecting: requestContext)
        for attr in mirror.children {
            guard let label = attr.label else { continue }
            switch attr.value {
            case let v as StringValue:
                requestContextStrings.updateValue(v.value, forKey: label)
            case let v as NumberValue:
                requestContextNumbers.updateValue(v.value, forKey: label)
            case let v as BooleanValue:
                requestContextBooleans.updateValue(v.value, forKey: label)
            default:
                continue
            }
        }


        return CommandContext(
            request: request,
            requestContextStrings: requestContextStrings,
            requestContextNumbers: requestContextNumbers,
            requestContextBooleans: requestContextBooleans)
    }

    public init(request: String,
        requestContextStrings: Dictionary<String, String> = [:],
        requestContextNumbers: Dictionary<String, Double> = [:],
        requestContextBooleans: Dictionary<String, Bool> = [:]) {
        self.request = request
        self.requestContextStrings = requestContextStrings
        self.requestContextNumbers = requestContextNumbers
        self.requestContextBooleans = requestContextBooleans
    }

    public func append(returnValue: BashiPlugin.CommandValue) async {
        _returnValues.append(.commandValue(returnValue))
    }

    public func append(error: Error) async {
        errors.append(error)
    }

    public func append(builtinAction: BashiPlugin.CommandBuiltinAction) async {
        _returnValues.append(.action(builtinAction))
    }
    
    public func getReturnValues() async -> [BashiPlugin.CommandValue] {
        return _returnValues.compactMap({
            switch $0 {
            case .commandValue(let v): return v
            default: return nil
            }
        })
    }
    
    public func getErrors() async -> [Error] {
        return errors
    }
}

extension CommandValue {
    convenience init(from apiClientValue: Value) {
        switch apiClientValue {
        case .booleanValue(let v):
            self.init(.boolean(v.value))
        case .numberValue(let v):
            self.init(.number(v.value))
        case .stringValue(let v):
            self.init(.string(v.value))
        }
    }
}
