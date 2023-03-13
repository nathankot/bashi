//
//  CommandsController.swift
//  assist
//
//  Created by Nathan Kot on 9/01/23.
//

import Foundation
import Cocoa
import BashiClient
import BashiPlugin

// TODO need to be able to exit the process loop when:
// * testing and all mocks have been queued
// * the user finishes a session
// also should this be renamed to sessions controller?

public actor CommandsController {

    public typealias RunModel = (ModelsAssist002Input) async throws -> ModelsAssist002Output

    let state: AppState
    let pluginsController: PluginsController

    let runModel: RunModel

    public init(
        state: AppState,
        pluginsController: PluginsController,
        runModel: @escaping RunModel) {
        self.state = state
        self.pluginsController = pluginsController
        self.runModel = runModel
    }

    public func process(initialRequest: String) async {
        var messages: [Message] = [.init(id: 0, message: initialRequest, type: .request)]
        var request: String? = initialRequest
        var resolvedCommands: [String: Value] = [:]
        let pluginAPI = PluginAPI(
            messageFn: { response, type in
                messages.append(.init(id: messages.count, message: response, type: type))
            },
            askFn: {
                let response = try await self.state.transitionAndWaitforStateCallback { callback in
                        .NeedsInput(
                        messages: messages,
                        type: .Question(onAnswer: callback)
                    )
                }
                messages.append(.init(id: messages.count, message: response.count > 280 ? response.prefix(280) + " [truncated]" : response, type: .userResponse))
                return response
            })

        do {
            interpreterLoop: while true {
                let input = ModelsAssist002Input(
                    request: request,
                    resolvedCommands: resolvedCommands)

                let response = try await state.transition(newState: .Processing(messages: messages)) { transition in
                    await transition()
                    return try await runModel(input)
                }

                // After the first model run, request should always be nil to indicate that
                // subsequent model runs are for the same request.
                request = nil
                let resultPending = response.result

                let commandContext = Context.from(request: initialRequest)

                for c in resultPending.pendingCommands {
                    guard case let .commandParsed(pendingCommand) = c else {
                        throw AppError.Internal("expected all pendingCommands to be unresolved")
                    }
                    let commandName = pendingCommand.name
                    // TODO custom handling for respond command
                    
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

            }
        } catch {
            await state.handleError(error)
        }
    }

    class PluginAPI: BashiPluginAPI {

        let messageFn: (String, MessageType) async -> Void
        let askFn: () async throws -> String

        init(messageFn: @escaping (String, MessageType) async -> Void,
            askFn: @escaping () async throws -> String) {
            self.messageFn = messageFn
            self.askFn = askFn
        }

        public func respond(message: String) async {
            return await messageFn(message, .modelResponse)
        }

        public func indicateCommandResult(message: String) async {
            return await messageFn(message, .sideEffectResult)
        }

        public func ask() async throws -> String {
            return try await askFn()
        }

        public func storeTextInPasteboard(text: String) async throws {
            let pasteboard = NSPasteboard.general
            pasteboard.declareTypes([.string], owner: nil)
            pasteboard.setString(text, forType: .string)
        }
    }

    static let builtinCommands = [
        AnonymousCommand(
            name: "respond",
            cost: .Low,
            description: "send a message to the user, the return value is the users response",
            args: [.init(type: .string, name: "answer")],
            returnType: .string
        ) { api, ctx, args in
            let result = args.first?.string ?? ""
            if result.count < 280 {
                await api.respond(message: result)
            } else {
                try await api.storeTextInPasteboard(text: result)
                await api.indicateCommandResult(message: "The result has been copied to your clipboard")
            }
            let response = try await api.ask()
            return .init(.string(response))
        },
    ]

    public actor Context: BashiPlugin.CommandContext {

        nonisolated public let request: String

        public static func from(request: String) -> Context {
            return Context(request: request)
        }

        public init(request: String) {
            self.request = request
        }
    }
}

extension BashiValue {
    static var void = BashiValue.init(.void)

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
