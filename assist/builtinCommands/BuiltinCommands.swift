//
//  BuiltinCommands.swift
//  builtinCommands
//
//  Created by Nathan Kot on 6/01/23.
//

import Foundation
import BashiPlugin

public class BuiltinCommands: BundledPlugin {
    static public var id: String = "builtinCommands"
    static public func makeBashiPlugin(api: PluginAPI) -> Plugin {
        return BuiltinCommands()
    }

    public func provideCommands() -> [Command] {
        return [
            AnonymousCommand(
                name: "answer",
                description: "<builtin>",
                args: [.init(type: .string, name: "the answer")],
                prepareFn: { api, ctx, args in
                    AnonymousPreparedCommand(
                        shouldSkipConfirmation: true,
                        confirmationMessage: "") {
                        if let s = args.first?.string {
                            await ctx.append(returnValue: .init(.string(s)))
                        }
                    }
                }),
            AnonymousCommand(
                name: "flushToSpeech",
                description: "<builtin>",
                prepareFn: { api, ctx, args in
                    AnonymousPreparedCommand(
                        shouldSkipConfirmation: true,
                        confirmationMessage: "") {
                        await ctx.append(builtinAction: .flushToDisplay)
                    }
                })
        ]
    }
}
