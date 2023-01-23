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

    public typealias RunModel = (ModelsAssist001Input) async throws -> ModelsAssist001Output

    let state: AppState
    let pluginsController: PluginsController

    let runModel: RunModel

    class PluginAPI: BashiPluginAPI {
        weak var controller: CommandsController!
        let insertMessage: (String, MessageType) -> Void
        
        init(controller: CommandsController!, insertMessage: @escaping (String, MessageType) -> Void) {
            self.controller = controller
            self.insertMessage = insertMessage
        }
        
        public func respond(message: String) async {
            insertMessage(message, .response)
        }
    }

    public init(
        state: AppState,
        pluginsController: PluginsController,
        runModel: @escaping RunModel) {
        self.state = state
        self.pluginsController = pluginsController
        self.runModel = runModel
    }

    public func process(initialRequest: String) async throws {
        var messages: [Message] = [.init(id: 0, message: initialRequest, type: .request)]
        var request: String? = initialRequest
        let requestContext = RequestContext.init()
        var resolvedCommands: [String: Value] = [:]
        let pluginAPI = PluginAPI(controller: self) {
            messages.append(.init(id: messages.count, message: $0, type: $1))
        }

        interpreterLoop: while true {
            let input = ModelsAssist001Input(
                request: request,
                requestContext: requestContext,
                resolvedCommands: resolvedCommands)

            let response = try await state.transition(newState: .Processing(messages: messages)) { transition in
                await transition()
                return try await runModel(input)
            }

            // After the first model run, request should always be nil to indicate that
            // subsequent model runs are for the same request.
            request = nil

            switch response.result {
            case .resultNeedsRequestContext(_):
                fatalError("requesting request context is unimplemented so far")
            case .resultPendingCommands(let resultPending):
                let commandContext = CommandContext.from(
                    request: initialRequest,
                    requestContext: requestContext
                )

                for c in resultPending.pendingCommands {
                    guard case let .commandParsed(pendingCommand) = c else {
                        throw AppError.Internal("expected all pendingCommands to be unresolved")
                    }
                    let commandName = pendingCommand.name
                    guard let commandDef = await pluginsController.lookup(command: commandName) else {
                        throw AppError.CommandNotFound(name: commandName)
                    }
                    let args = pendingCommand.args.map { BashiValue(from: $0) }
                    if args.count != commandDef.args.count ||
                        zip(args, commandDef.args)
                        .contains(where: { (serverArg, clientArg) in
                            serverArg.type != clientArg.type
                        }) {
                        throw AppError.CommandMismatchArgs(
                            name: commandName,
                            error: """
                            client expects \(commandDef.args.count) args, server gave \(args.count)
                            client args: \(commandDef.args.map{$0.type.asString()})
                            server gave: \(args.map{$0.type.asString()})
                            """)
                    }

                    logger.debug("running command: \(commandName)")
                    let result = try await commandDef.run(
                        api: pluginAPI,
                        context: commandContext,
                        args: args)
                    if result.type != commandDef.returnType {
                        throw AppError.CommandMismatchResult(
                            name: commandName,
                            expected: commandDef.returnType.asString(),
                            actual: result.type.asString())
                    }

                    resolvedCommands.updateValue(result.toAPIValue(), forKey: pendingCommand.id)
                }

                // After running the commands, start the loop again.
                continue interpreterLoop
            case .resultFinished(_):
                // TODO implement implicit flush here - display the last result if
                // no command before this ended up displaying anything.
                try await state.transition(newState: .Success(messages: messages))
                return
            }
        }
    }

}

public actor CommandContext: BashiPlugin.CommandContext {

    nonisolated public let request: String
    nonisolated public let requestContextStrings: Dictionary<String, String>
    nonisolated public let requestContextNumbers: Dictionary<String, Double>
    nonisolated public let requestContextBooleans: Dictionary<String, Bool>

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
            case .voidValue:
                break
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
}

extension BashiValue {
    convenience init(from apiClientValue: Value) {
        switch apiClientValue {
        case .booleanValue(let v):
            self.init(.boolean(v.value))
        case .numberValue(let v):
            self.init(.number(v.value))
        case .stringValue(let v):
            self.init(.string(v.value))
        case .voidValue:
            self.init(.void)
        }
    }

    func toAPIValue() -> Value {
        switch self.type {
        case .string: return .stringValue(.init(type: .string, value: self.string ?? ""))
        case .number: return .numberValue(.init(type: .number, value: Double(exactly: self.number ?? 0) ?? 0))
        case .boolean: return .booleanValue(.init(type: .boolean, value: self.boolean == 1))
        case .void: return .voidValue(.init(type: .void))
        }
    }
}



