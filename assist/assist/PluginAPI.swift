//
//  PluginAPI.swift
//  assist
//
//  Created by Nathan Kot on 24/01/23.
//

import Foundation
import BashiPlugin

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

    static let builtinCommands = [
        AnonymousCommand(
            name: "answer",
            description: "answer the original question directly",
            args: [.init(type: .string, name: "answer")],
            returnType: .void,
            runFn: { api, ctx, args in
                await api.respond(message: args.first?.string ?? "could not get message")
                return .init(.void)
            })
    ]
}
