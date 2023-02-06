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

public actor CommandsController {

    public typealias RunModel = (ModelsAssist001Input) async throws -> ModelsAssist001Output

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
            respondFn: { response in
                messages.append(.init(id: messages.count, message: response, type: .modelResponse))
            },
            askFn: { question in
                return try await self.state.transitionAndWaitforStateCallback { callback in
                        .NeedsInput(
                        messages: messages,
                        type: .Question(message: question, onAnswer: callback)
                    )
                }
            })

        do {
            interpreterLoop: while true {
                let input = ModelsAssist001Input(
                    request: request,
                    resolvedCommands: resolvedCommands)

                let response = try await state.transition(newState: .Processing(messages: messages)) { transition in
                    await transition()
                    return try await runModel(input)
                }

                // After the first model run, request should always be nil to indicate that
                // subsequent model runs are for the same request.
                request = nil

                switch response.result {

                case .resultPendingCommands(let resultPending):
                    let commandContext = Context.from(request: initialRequest)

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

                case .resultFinished(let resultFinished):
                    if messages.count == 1 {
                        if let lastValue = resultFinished.results.reversed().compactMap({ (v) -> String? in
                                switch v {
                                case .stringValue(let s): return s.value
                                case .numberValue(let n): return "\(n)"
                                case .booleanValue(let b): return b.value ? "True" : "False"
                                default: return nil
                                }
                            }).first {
                            try await pluginAPI.respondFn(lastValue)
                        }
                    }
                    try await state.transition(newState: .Finished(messages: messages))
                    return
                }
            }
        } catch {
            await state.handleError(error)
        }
    }

    class PluginAPI: BashiPluginAPI {
        let respondFn: (String) async throws -> Void
        let askFn: (String) async throws -> String

        init(respondFn: @escaping (String) async throws -> Void,
            askFn: @escaping (String) async throws -> String) {
            self.respondFn = respondFn
            self.askFn = askFn
        }

        public func respond(message: String) async throws {
            return try await respondFn(message)
        }

        public func ask(question: String) async throws -> String {
            return try await askFn(question)
        }

        public func storeTextInPasteboard(text: String) async throws {
            let pasteboard = NSPasteboard.general
            pasteboard.declareTypes([.string], owner: nil)
            pasteboard.setString(text, forType: .string)
        }
    }

    static let builtinCommands = [
        AnonymousCommand(
            name: "sendResponse",
            cost: .Low,
            description: "return response for original question/request back to the user",
            args: [.init(type: .string, name: "answer")],
            returnType: .void
        ) { api, ctx, args in
            let result = args.first?.string ?? ""
            if result.count < 560 {
                try await api.respond(message: result)
            } else {
                try await api.storeTextInPasteboard(text: result)
                try await api.respond(message: "The result has been copied to your clipboard")
            }
            return .init(.void)
        },
        AnonymousCommand(
            name: "writeResponse",
            cost: .Low,
            description: "help user write response for original question/request",
            args: [.init(type: .string, name: "answer")],
            returnType: .void
        ) { api, ctx, args in
            let result = args.first?.string ?? ""
            if result.count < 560 {
                try await api.respond(message: result)
            } else {
                try await api.storeTextInPasteboard(text: result)
                try await api.respond(message: "The result has been copied to your clipboard")
            }
            return .init(.void)
        },
        AnonymousCommand(
            name: "getInput",
            cost: .Low,
            description: "ask user to question/request or for input additional input",
            args: [.init(type: .string, name: "question asking for required information")],
            returnType: .string
        ) { api, ctx, args in
            guard let question = args.first?.string else {
                throw AppError.Internal("expected first argument to be a string")
            }
            let response = try await api.ask(question: question)
            return .init(.string(response))
        },
        AnonymousCommand(
            name: "getClarification",
            cost: .Low,
            description: "clarify the original question/request",
            args: [.init(type: .string, name: "question asking for clarification")],
            returnType: .string
        ) { api, ctx, args in
            guard let question = args.first?.string else {
                throw AppError.Internal("expected first argument to be a string")
            }
            let response = try await api.ask(question: question)
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
