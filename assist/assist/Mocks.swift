//
//  Mocks.swift
//
//
//  Created by Nathan Kot on 9/01/23.
//

#if DEBUG
    import Foundation
    import BashiPlugin

    public class MockPlugin: BashiPluginProtocol {

        public enum ErrorType: Error {
            case mockError
            case expectedStringArg
        }

        public static var id: String = "mockPlugin"

        public init() { }

        public func prepare() async throws { }

        public func provideCommands() -> [BashiPlugin.Command] {
            return [
                AnonymousCommand(
                    name: "mock_command",
                    cost: .Low,
                    description: "do some thing",
                    returnType: .string
                ) { api, ctx, _ in
                    return .init(.string("some result A"))
                },
                AnonymousCommand(
                    name: "mock_command_throws",
                    cost: .Low,
                    description: "do some thing",
                    returnType: .void
                ) { api, ctx, args in
                    throw ErrorType.mockError
                },
                AnonymousCommand(
                    name: "mock_command_return_argument",
                    cost: .Low,
                    description: "do some thing",
                    args: [.init(type: .string, name: "any string")],
                    returnType: .string
                ) { api, ctx, args in
                    if let str = args.first?.string {
                        return .init(.string(str))
                    }
                    throw ErrorType.expectedStringArg
                },
                AnonymousCommand(
                    name: "mock_wrong_return_type",
                    cost: .Low,
                    description: "do some thing",
                    returnType: .string
                ) { api, ctx, _ in
                    return .init(.void)
                },
            ]
        }


    }

#endif
