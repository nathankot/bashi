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
    var modelInputs: [ModelsAssist002Input] = []
    var mockResults: [ResultPendingCommands] = []
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
                        model: .assist002,
                        request: "some request",
                        result: self.mockResults.count == 0
                            ? .init(type: .pendingCommands, pendingCommands: [.commandParsed(.init(id: "11111", type: .parsed, name: "respond", args: [.stringValue(.init(type: .string, value: "some string"))]))], results: [])
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
                .init(type: .pendingCommands, pendingCommands: [
                    .commandParsed(.init(id: "0", type: .parsed, name: "mock_command", args: [])),
                    .commandParsed(.init(id: "1", type: .parsed, name: "respond", args: [
                        .stringValue(.init(type: .string, value: "response 1"))
                    ]))
                ], results: []),
                .init(type: .pendingCommands, pendingCommands: [
                    .commandParsed(.init(id: "2", type: .parsed, name: "respond", args: [
                        .stringValue(.init(type: .string, value: "response 2"))
                    ]))
                ], results: []),
        ]

        let t = Task.detached { await self.commandsController.process(initialRequest: "some request") }
        defer { t.cancel() }

        try await Task.sleep(for: .milliseconds(100))
        
        guard case let .NeedsInput(messages: messages, inputType) = await state.state else {
            XCTFail("expected state to be NeedsInput")
            return
        }
        XCTAssertEqual(messages.map { $0.message }, [
            "some request",
            "response 1",
        ])

        
        try await Task.sleep(for: .milliseconds(100))
        
        // Send a response:
        guard case let .Question(onAnswer, _) = inputType else {
            XCTFail("expected an onAnswer callback")
            return
        }
        onAnswer("answer 1")
        
        try await Task.sleep(for: .milliseconds(100))
        
        if case let .NeedsInput(messages: messages, _) = await state.state {
            XCTAssertEqual(messages.map { $0.message }, [
                "some request",
                "response 1",
                "answer 1",
                "response 2"
            ])
        } else {
            XCTFail("expected state to be NeedsInput")
            return
        }

    }

   
    func testWrongArgumentType() async throws {
        mockResults = [
            .init(type: .pendingCommands, pendingCommands: [
                .commandParsed(.init(id: "0", type: .parsed, name: "respond", args: [
                    // number is the wrong arg type:
                    .numberValue(.init(type: .number, value: 123))
                ]))
            ], results: [])
        ]
        let t = Task.detached { await self.commandsController.process(initialRequest: "some request") }
        defer { t.cancel() }
        try await Task.sleep(for: .milliseconds(100))
        if case let .Error(e) = await state.state {
            XCTAssertEqual(e.errorDescription, "command args mismatch: respond, client expects 1 args, server gave 1\nclient args: [\"string\"]\nserver gave: [\"number\"]")
        } else {
            XCTFail("expected state to be in error")
        }
    }

    func testWrongArgumentCount() async throws {
        mockResults = [
            .init(type: .pendingCommands, pendingCommands: [
                .commandParsed(.init(id: "0", type: .parsed, name: "respond", args: []))
            ], results: [])
        ]
        let t = Task.detached { await self.commandsController.process(initialRequest: "some request") }
        defer { t.cancel() }
        try await Task.sleep(for: .milliseconds(100))
        if case let .Error(e) = await state.state {
            XCTAssertEqual(e.errorDescription, "command args mismatch: respond, client expects 1 args, server gave 0\nclient args: [\"string\"]\nserver gave: []")
        } else {
            XCTFail("expected state to be in error")
        }
    }
    
    func testWrongReturnType() async throws {
        mockResults = [
            .init(type: .pendingCommands, pendingCommands: [
                .commandParsed(.init(id: "0", type: .parsed, name: "mock_wrong_return_type", args: []))
            ], results: [])
        ]
        let t = Task.detached { await self.commandsController.process(initialRequest: "some request") }
        defer { t.cancel() }
        try await Task.sleep(for: .milliseconds(100))
        if case let .Error(e) = await state.state {
            XCTAssertEqual(e.errorDescription, "command mock_wrong_return_type return value type mismatch. expected string got void")
        } else {
            XCTFail("expected state to be in error")
        }
    }

    func testCommandNotFound() async throws {
        mockResults = [
            .init(type: .pendingCommands, pendingCommands: [
                .commandParsed(.init(id: "0", type: .parsed, name: "non_existent", args: []))
            ], results: [])
        ]
        let t = Task.detached { await self.commandsController.process(initialRequest: "some request") }
        defer { t.cancel() }
        try await Task.sleep(for: .milliseconds(100))
        if case let .Error(e) = await state.state {
            XCTAssertEqual(e.errorDescription, "command not found: non_existent")
        } else {
            XCTFail("expected state to be in error")
        }
    }
    
//    func testCommandNotConfirmed() async throws {}

}
