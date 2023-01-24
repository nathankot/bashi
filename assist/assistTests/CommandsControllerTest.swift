//
//  CommandsControllerTest.swift
//
//
//  Created by Nathan Kot on 9/01/23.
//

import Foundation
import XCTest
import BashiClient
import assist

final class CommandsControllerTest: XCTestCase {

    var state: AppState!
    var pluginsController: PluginsController!
    var commandsController: CommandsController!
    var mockResults: [ModelsAssist001Output.Result] = []
    var mockError: Error? = nil

    override func setUpWithError() throws {
        let e = expectation(description: "load plugin")
        Task {
            mockResults = []
            mockError = nil
            state = await AppState(accountNumber: "123")
            pluginsController = PluginsController(state: state)
            commandsController = CommandsController(
                state: state,
                pluginsController: pluginsController,
                runModel: { input in
                    if let e = self.mockError {
                        throw e
                    }
                    return .init(
                        model: .assist001,
                        request: "some request",
                        result: self.mockResults.count == 0
                            ? .resultFinished(.init(type: .finished, resolvedCommands: []))
                            : self.mockResults.removeFirst()
                    )

                })
            try await pluginsController.loadPlugin(
                MockPlugin(), withId: "mockPlugin")
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
                ], resolvedCommands: [])),
                .resultFinished(.init(type: .finished, resolvedCommands: []))
        ]

        try await commandsController.process(initialRequest: "some request")

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
                ], resolvedCommands: [])),
                .resultFinished(.init(type: .finished, resolvedCommands: [
                    // Note here that commands controller ultimately uses what the server
                    // returns as 'resolved commands' as the source of truth:
                    .init(
                        id: "0",
                        type: .executed,
                        name: "mock_command",
                        args: [],
                        returnValue: .stringValue(
                        .init(type: .string, value: "some result hello")))
                ]))
        ]

        try await commandsController.process(initialRequest: "some request")

        guard case let .Finished(messages: messages) = await state.state else {
            XCTFail("expected a finished result")
            return
        }

        XCTAssertEqual(messages.map { $0.message }, [
            "some request",
            "some result hello",
        ])
    }

    func testWrongArgumentType() async throws {
        let expectation = expectation(description: "should throw err")
        do {
            mockResults = [
                .resultPendingCommands(.init(type: .pendingCommands, pendingCommands: [
                    .commandParsed(.init(id: "0", type: .parsed, name: "mock_display", args: [
                        // number is the wrong arg type:
                        .numberValue(.init(type: .number, value: 123))
                    ]))
                ], resolvedCommands: []))
            ]
            try await commandsController.process(initialRequest: "some request")
        } catch let e as AppError {
            switch e {
            case .CommandMismatchArgs:
                expectation.fulfill()
            default: throw e
            }
        }
        await waitForExpectations(timeout: 2)
    }
    
    func testWrongArgumentCount() async throws {
        let expectation = expectation(description: "should throw err")
        do {
            mockResults = [
                .resultPendingCommands(.init(type: .pendingCommands, pendingCommands: [
                    .commandParsed(.init(id: "0", type: .parsed, name: "mock_display", args: []))
                ], resolvedCommands: []))
            ]
            try await commandsController.process(initialRequest: "some request")
        } catch let e as AppError {
            switch e {
            case .CommandMismatchArgs:
                expectation.fulfill()
            default: throw e
            }
        }
        await waitForExpectations(timeout: 2)
    }
    
    func testWrongReturnType() async throws {
        let expectation = expectation(description: "should throw err")
        do {
            mockResults = [
                .resultPendingCommands(.init(type: .pendingCommands, pendingCommands: [
                    .commandParsed(.init(id: "0", type: .parsed, name: "mock_wrong_return_type", args: []))
                ], resolvedCommands: []))
            ]
            try await commandsController.process(initialRequest: "some request")
        } catch let e as AppError {
            switch e {
            case .CommandMismatchResult:
                expectation.fulfill()
            default: throw e
            }
        }
        await waitForExpectations(timeout: 2)
    }
    
    func testCommandNotFound() async throws {
        let expectation = expectation(description: "should throw err")
        do {
            mockResults = [
                .resultPendingCommands(.init(type: .pendingCommands, pendingCommands: [
                    .commandParsed(.init(id: "0", type: .parsed, name: "non_existent", args: []))
                ], resolvedCommands: []))
            ]
            try await commandsController.process(initialRequest: "some request")
        } catch let e as AppError {
            switch e {
            case .CommandNotFound:
                expectation.fulfill()
            default: throw e
            }
        }
        await waitForExpectations(timeout: 2)
    }
//    func testCommandNotConfirmed() async throws {}

}
