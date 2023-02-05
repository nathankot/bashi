//
//  CommandsControllerTest.swift
//
//
//  Created by Nathan Kot on 9/01/23.
//

import Foundation
import XCTest
import BashiClient
import Combine
import assist

final class CommandsControllerTest: XCTestCase {

    var state: AppState!
    var pluginsController: PluginsController!
    var commandsController: CommandsController!
    var modelInputs: [ModelsAssist001Input] = []
    var mockResults: [ModelsAssist001Output.Result] = []
    var mockError: Error? = nil
    var subs: Set<AnyCancellable> = .init()

    override func setUpWithError() throws {
        let e = expectation(description: "load plugin")
        Task {
            subs = .init()
            modelInputs = []
            mockResults = []
            mockError = nil
            state = await AppState(accountNumber: "123")
            pluginsController = PluginsController(state: state)
            commandsController = CommandsController(
                state: state,
                pluginsController: pluginsController,
                runModel: { input in
                    self.modelInputs.append(input)
                    if let e = self.mockError {
                        throw e
                    }
                    return .init(
                        model: .assist001,
                        request: "some request",
                        result: self.mockResults.count == 0
                            ? .resultFinished(.init(type: .finished, results: []))
                        : self.mockResults.removeFirst()
                    )

                })
            try await pluginsController.loadBuiltinCommands()
            try await pluginsController.loadPlugin(MockPlugin(), withId: "mockPlugin")
            e.fulfill()
        }

        wait(for: [e], timeout: 5)
    }

    override func tearDownWithError() throws {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }

    func testCommandsHandle() async throws {
        mockResults = [
                .resultPendingCommands(.init(type: .pendingCommands, pendingCommands: [
                    .commandParsed(.init(id: "1", type: .parsed, name: "mock_display", args: [
                        .stringValue(.init(type: .string, value: "something"))
                    ]))
                ], results: [])),
                .resultFinished(.init(type: .finished, results: []))
        ]

        await commandsController.process(initialRequest: "some request")

        guard case let .Finished(messages: messages) = await state.state else {
            XCTFail("expected a finished result")
            return
        }

        XCTAssertEqual(messages.map { $0.message }, [
                "some request",
                "something",
            ])
    }

    func testCommandsHandleImplicitFlush() async throws {
        mockResults = [
                .resultPendingCommands(.init(type: .pendingCommands, pendingCommands: [
                    .commandParsed(.init(id: "0", type: .parsed, name: "mock_command", args: [])),
                ], results: [])),
                .resultFinished(.init(type: .finished, results: [
                // Note here that commands controller ultimately uses what the server
                // returns as 'resolved commands' as the source of truth:
                .stringValue(.init(type: .string, value: "some result hello"))
                ]))
        ]

        await commandsController.process(initialRequest: "some request")

        guard case let .Finished(messages: messages) = await state.state else {
            XCTFail("expected a finished result")
            return
        }

        XCTAssertEqual(messages.map { $0.message }, [
                "some request",
                "some result hello",
            ])
    }

    func testAsk() async throws {
        mockResults = [
                .resultPendingCommands(.init(type: .pendingCommands, pendingCommands: [
                    .commandParsed(.init(id: "1", type: .parsed, name: "getInput", args: [
                        .stringValue(.init(type: .string, value: "what is your name?"))
                    ]))
                ], results: [])),
                .resultFinished(.init(type: .finished, results: []))
        ]

        try await withThrowingTaskGroup(of: Void.self) { group in
            group.addTask {
                await self.commandsController.process(initialRequest: "some request")
            }
            group.addTask {
                let needsInputStatePub = await self.state.$state.first {
                    if case .NeedsInput = $0 { return true }
                    else { return false }
                }
                await withCheckedContinuation { continuation in
                    self.subs.insert(needsInputStatePub.sink(receiveValue: { state in
                        if case let .NeedsInput(_, inputType) = state {
                            if case let .Question(question, callback) = inputType {
                                XCTAssertEqual(question, "what is your name?")
                                callback("some answer")
                                continuation.resume()
                            }
                        }
                    }))
                }

            }
            for try await _ in group { }
        }

        guard case .Finished = await state.state else {
            XCTFail("expected a finished result")
            return
        }
    }

    func testWrongArgumentType() async throws {
        mockResults = [
                .resultPendingCommands(.init(type: .pendingCommands, pendingCommands: [
                    .commandParsed(.init(id: "0", type: .parsed, name: "mock_display", args: [
                    // number is the wrong arg type:
                    .numberValue(.init(type: .number, value: 123))
                    ]))
                ], results: []))
        ]
        await commandsController.process(initialRequest: "some request")
        if case let .Error(e) = await state.state {
            XCTAssertEqual(e.errorDescription, "command args mismatch: mock_display, client expects 1 args, server gave 1\nclient args: [\"string\"]\nserver gave: [\"number\"]")
        } else {
            XCTFail("expected state to be in error")
        }
    }

    func testWrongArgumentCount() async throws {
        mockResults = [
                .resultPendingCommands(.init(type: .pendingCommands, pendingCommands: [
                    .commandParsed(.init(id: "0", type: .parsed, name: "mock_display", args: []))
                ], results: []))
        ]
        await commandsController.process(initialRequest: "some request")
        if case let .Error(e) = await state.state {
            XCTAssertEqual(e.errorDescription, "command args mismatch: mock_display, client expects 1 args, server gave 0\nclient args: [\"string\"]\nserver gave: []")
        } else {
            XCTFail("expected state to be in error")
        }
    }

    func testWrongReturnType() async throws {
        mockResults = [
                .resultPendingCommands(.init(type: .pendingCommands, pendingCommands: [
                    .commandParsed(.init(id: "0", type: .parsed, name: "mock_wrong_return_type", args: []))
                ], results: []))
        ]
        await commandsController.process(initialRequest: "some request")
        if case let .Error(e) = await state.state {
            XCTAssertEqual(e.errorDescription, "command mock_wrong_return_type return value type mismatch. expected string got void")
        } else {
            XCTFail("expected state to be in error")
        }
    }

    func testCommandNotFound() async throws {
        mockResults = [
                .resultPendingCommands(.init(type: .pendingCommands, pendingCommands: [
                    .commandParsed(.init(id: "0", type: .parsed, name: "non_existent", args: []))
                ], results: []))
        ]
        await commandsController.process(initialRequest: "some request")
        if case let .Error(e) = await state.state {
            XCTAssertEqual(e.errorDescription, "command not found: non_existent")
        } else {
            XCTFail("expected state to be in error")
        }
    }
//    func testCommandNotConfirmed() async throws {}

}
