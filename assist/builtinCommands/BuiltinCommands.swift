//
//  BuiltinCommands.swift
//  builtinCommands
//
//  Created by Nathan Kot on 6/01/23.
//

import Foundation
import BashiPlugin
import EventKit

public class BuiltinCommands: BundledPlugin {

    static public var id: String = "builtinCommands"
    static public func makeBashiPlugin(api: PluginAPI) -> Plugin {
        return BuiltinCommands()
    }

    public func prepare() async throws { }

    public func provideCommands() -> [Command] {
        return [
            AnonymousCommand(
                name: "answer",
                description: "<builtin>",
                args: [.init(type: .string, name: "the answer")],
                prepareFn: { api, ctx, args, _ in
                    AnonymousPreparedCommand(
                        shouldSkipConfirmation: true,
                        confirmationMessage: "") {
                        if let s = args.first?.string {
                            await ctx.append(returnValue: .init(.string(s)))
                        }
                    }
                }),
            AnonymousCommand(
                name: "display",
                description: "<builtin>",
                prepareFn: { api, ctx, args, _ in
                    AnonymousPreparedCommand(
                        shouldSkipConfirmation: true,
                        confirmationMessage: "") {
                        await ctx.append(builtinAction: .display)
                    }
                }),
            AnonymousCommand(
                name: "write",
                description: "<builtin>",
                prepareFn: { api, ctx, args, _ in
                    AnonymousPreparedCommand(
                        shouldSkipConfirmation: true,
                        confirmationMessage: "") {
                        fatalError("not implemented")
                    }
                }),
            AnonymousCommand(
                name: "fail",
                description: "<builtin>",
                prepareFn: { api, ctx, args, _ in
                    AnonymousPreparedCommand(
                        shouldSkipConfirmation: true,
                        confirmationMessage: "") {
                        fatalError("not implemented")
                    }
                })
        ]
    }
}
