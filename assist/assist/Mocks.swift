//
//  Mocks.swift
//
//
//  Created by Nathan Kot on 9/01/23.
//

import Foundation
import BashiPlugin

#if DEBUG

    public class MockPluginAPI: BashiPluginAPI {
        public var seenFlushed: [String] = []
        public init() { }

        public func respond(message: String) async {
            seenFlushed.append(message)
        }
    }

    public class MockPlugin: BashiPluginProtocol {

        public enum ErrorType: Error {
            case mockError
        }

        public static var id: String = "mockPlugin"

        public init() { }

        public func prepare() async throws { }

        public func provideCommands() -> [BashiPlugin.Command] {
            return [
                AnonymousCommand(name: "mock_command", description: "do some thing") { api, ctx, _ in
                    return .init(.string("some result A"))
                },
                AnonymousCommand(name: "mock_command_no_confirm", description: "do some thing") { api, ctx, args in
                    return .init(.string("some result B"))
                },
                AnonymousCommand(name: "mock_command_throws", description: "do some thing") { api, ctx, args in
                    throw ErrorType.mockError
                },
                AnonymousCommand(
                    name: "mock_command_return_argument",
                    description: "do some thing",
                    args: [.init(type: .string, name: "any string")]
                ) { api, ctx, args in
                    if let str = args.first?.string {
                        return .init(.string(str))
                    }
                    return .init(.string("some result C"))
                },
                AnonymousCommand(name: "display", description: "display a message to the user", args: [.init(type: .string, name: "message")]) { api, ctx, args in
                    // TODO: why is this async block not compiling?
                    await api.respond(message: args.first?.string ?? "<could not get message>")
                    return .init(.void)
                },
            ]
        }


    }

#endif
