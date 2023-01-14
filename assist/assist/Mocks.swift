//
//  Mocks.swift
//
//
//  Created by Nathan Kot on 9/01/23.
//

import Foundation
import BashiPlugin

#if DEBUG

public class MockPluginAPI: PluginAPI {
    public var seenResults: [String] = []
    public func setResultForTesting(text: String) {
        seenResults.append(text)
    }
    public init() {}
}

public class MockPlugin: Plugin {
    
    public enum ErrorType: Error {
        case mockError
    }

    public static var id: String = "mockPlugin"
    
    public init() {}
    
    public func prepare() async throws {}

    public func provideCommands() -> [BashiPlugin.Command] {
        return [
            AnonymousCommand(name: "mock_command", description: "do some thing") { api, ctx, _ in
                return AnonymousPreparedCommand(
                    shouldSkipConfirmation: false,
                    confirmationMessage: "some confirmation message",
                    runFn: {
                        api.setResultForTesting?(text: "some result A")
                        await ctx.append(returnValue: CommandValue(.string("some result B")))
                    })
            },
            AnonymousCommand(name: "mock_command_no_confirm", description: "do some thing") { api, ctx, args in
                return AnonymousPreparedCommand(
                    shouldSkipConfirmation: true,
                    confirmationMessage: "",
                    runFn: {
                        api.setResultForTesting?(text: "some result C")
                        await ctx.append(returnValue: CommandValue(.string("some result D")))
                    })
            },
            AnonymousCommand(name: "mock_command_throws", description: "do some thing") { api, ctx, args in
                return AnonymousPreparedCommand(
                    shouldSkipConfirmation: true,
                    confirmationMessage: "",
                    runFn: { throw ErrorType.mockError })
            },
            AnonymousCommand(
                name: "mock_command_return_argument",
                description: "do some thing",
                args: [.init(type: .string, name: "any string")]
            ) { api, ctx, args in
                return AnonymousPreparedCommand(
                    shouldSkipConfirmation: false,
                    confirmationMessage: "confirm?",
                    runFn: {
                        if let str = args.first?.string {
                            await ctx.append(returnValue: CommandValue(.string(str)))
                        }
                        api.setResultForTesting?(text: "some result E")
                    })
            },
            AnonymousCommand(name: "flush", description: "flush to display") { api, ctx, _ in
                return AnonymousPreparedCommand(
                    shouldSkipConfirmation: true,
                    confirmationMessage: "",
                    runFn: {
                        await ctx.append(builtinAction: .flushToDisplay)
                    })
            },
        ]
    }


}

#endif
