//
//  Mocks.swift
//
//
//  Created by Nathan Kot on 9/01/23.
//

import Foundation
import BashiPlugin

class MockPluginAPI: PluginAPI {
    var seenResults: [String] = []
    func setResultForTesting(text: String) {
        seenResults.append(text)
    }
}

class MockPlugin: Plugin {
    enum ErrorType: Error {
        case mockError
    }

    static var id: String = "mockPlugin"

    func provideCommands() -> [BashiPlugin.Command] {
        return [
            AnonymousCommand(name: "mock_command", description: "do some thing") { api, ctx, _ in
                return AnonymousPreparedCommand(
                    shouldSkipConfirmation: false,
                    confirmationMessage: "some confirmation message",
                    runFn: {
                        api.setResultForTesting?(text: "some result A")
                        ctx.returnValues.append(CommandValue(.string("some result B")))
                    })
            },
            AnonymousCommand(name: "mock_command_no_confirm", description: "do some thing") { api, ctx, args in
                return AnonymousPreparedCommand(
                    shouldSkipConfirmation: true,
                    confirmationMessage: "",
                    runFn: {
                        api.setResultForTesting?(text: "some result C")
                        ctx.returnValues.append(CommandValue(.string("some result D")))
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
                            ctx.returnValues.append(CommandValue(.string(str)))
                        }
                        api.setResultForTesting?(text: "some result E")
                    })
            },
        ]
    }


}
