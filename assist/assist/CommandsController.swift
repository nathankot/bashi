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
        requestContext: RequestContext,
        confirmationHandler: (String) async -> Bool
    ) async throws -> CommandContext {
        if let missingRequestContext = assistResponse.missingRequestContext {
            throw AppError.Internal("fulfillment of missing request context not yet implemented: \(missingRequestContext)")
        }

        let commandContext = CommandContext.from(requestContext: requestContext)
        var errors: [CommandError] = []

        for command in assistResponse.commands {
            switch command {
            case .commandInvalid(let c):
                errors.append(.commandInvalid(c.invalidReason))
            case .commandParseError(let c):
                errors.append(.commandParseError(c.error))
            case .commandExecuted(let c):
                switch c.returnValue {
                case .stringValue(let v):
                    commandContext.returnValues.append(
                        CommandValue(.string(v.value)))
                case .numberValue(let v):
                    commandContext.returnValues.append(
                        CommandValue(.number(v.value)))
                case .booleanValue(let v):
                    commandContext.returnValues.append(
                        CommandValue(.boolean(v.value)))
                }
            case .commandParsed(let c):
                guard let commandDef = await pluginsController.lookup(command: c.name) else {
                    errors.append(.commandNotFound(c.name))
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
                    args: []
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

public class CommandContext: BashiPlugin.CommandContext {

    public private(set) var requestContextStrings: Dictionary<String, String> = [:]
    public private(set) var requestContextNumbers: Dictionary<String, Double> = [:]
    public private(set) var requestContextBooleans: Dictionary<String, Bool> = [:]
    public var error: Error? = nil
    public var returnValues: [BashiPlugin.CommandValue] = []

    static func from(requestContext: RequestContext) -> CommandContext {
        let ctx = CommandContext()

        for (name, value) in requestContext.additionalProperties {
            switch value {
            case .stringValue(let v):
                ctx.requestContextStrings.updateValue(v.value, forKey: name)
            case .numberValue(let v):
                ctx.requestContextNumbers.updateValue(v.value, forKey: name)
            case .booleanValue(let v):
                ctx.requestContextBooleans.updateValue(v.value, forKey: name)
            }
        }

        // Use reflection, this ensures that the following does not need
        // to be updated when new well-known request context values are added.
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
