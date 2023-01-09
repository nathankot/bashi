//
//  BuiltinCommands.swift
//  builtinCommands
//
//  Created by Nathan Kot on 6/01/23.
//

import Foundation
import BashiPlugin

public class BuiltinCommands : BundledPlugin {
    static public var id: String = "builtInCommands"
    static public func makeBashiPlugin(api: PluginAPI) -> Plugin {
        return BuiltinCommands()
    }
    
    public func provideCommands() -> [Command] {
        return [
            AnonymousCommand(
                name: "flushToSpeech",
                description: "<builtin>",
                prepareFn: { api, ctx, args in
                    AnonymousPreparedCommand(
                        shouldSkipConfirmation: true,
                        confirmationMessage: "") {
                            await api.displayResult(text: ctx.stringReturnValues.first ?? "")
                        }
                })
        ]
    }
}

