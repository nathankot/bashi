//
//  CommandsControllerTest.swift
//
//
//  Created by Nathan Kot on 9/01/23.
//

import Foundation
import XCTest
import BashiPlugin
import builtinCommands
import assist

final class CommandsControllerTest: XCTestCase {

    var pluginAPI: MockPluginAPI!
    var pluginsController: PluginsController!
    var commandsController: CommandsController!

    override func setUpWithError() throws {
        pluginAPI = MockPluginAPI()
        pluginsController = PluginsController(pluginAPI: pluginAPI)
        commandsController = CommandsController(
            pluginAPI: pluginAPI,
            pluginsController: pluginsController)

        let e = expectation(description: "load plugin")
        Task {
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
        let resultContext = try await commandsController.handle(
            assistResponse: .init(
                model: .assist000,
                request: "some request",
                commands: [.commandParsed(.init(
                    line: "",
                    type: .parsed,
                    name: "mock_command",
                    args: []
                    ))]),
            commandContext: .init(request: "blah")
        ) { confirmationMessage in true }

        let returnValues = await resultContext.getReturnValues().map({ $0.string ?? "" })
        XCTAssertEqual(returnValues, ["some result B"])
        XCTAssertEqual(pluginAPI.seenResults, ["some result A"])
    }

    func testCommandNotConfirmed() async throws {
        let expectation = expectation(description: "should throw error")
        do {
            _ = try await commandsController.handle(
                assistResponse: .init(
                    model: .assist000,
                    request: "some request",
                    commands: [
                            .commandParsed(.init(
                            line: "",
                            type: .parsed,
                            name: "mock_command_no_confirm",
                            args: []
                            )),
                            .commandParsed(.init(
                            line: "",
                            type: .parsed,
                            name: "mock_command",
                            args: []
                            ))
                    ]
                ),
                commandContext: .init(request: "blah")
            ) { confirmationMessage in false }
        } catch let e as CommandsController.CommandError {
            switch e {
            case .commandNotConfirmed(let resultContext):
                let returnValues = await resultContext.getReturnValues().map({ $0.string ?? "" })
                XCTAssertEqual(returnValues, ["some result D"])
                XCTAssertEqual(pluginAPI.seenResults, ["some result C"])
                expectation.fulfill()
            default:
                throw e
            }
        }
        
        await waitForExpectations(timeout: 2)
    }

    func testWrongArgumentType() async throws {
        let expectation = expectation(description: "should throw err")
        do {
            _ = try await commandsController.handle(
                assistResponse: .init(
                    model: .assist000,
                    request: "some request",
                    commands: [
                            .commandParsed(.init(
                            line: "",
                            type: .parsed,
                            name: "mock_command_return_argument",
                            args: [.numberValue(.init(type: .number, value: 123))]
                            ))
                    ]
                ),
                commandContext: .init(request: "blah")
            ) { confirmationMessage in true }
        } catch let e as CommandsController.CommandError {
            switch e {
            case .mismatchArgs(let reason):
                XCTAssertEqual(reason, "the argument 'any string' expects a string")
                expectation.fulfill()
            default:
                throw e
            }
        }
        
        await waitForExpectations(timeout: 2)
    }
    
    func testWrongArgumentNumberOfArguments() async throws {
        let expectation = expectation(description: "should throw err")
        do {
            _ = try await commandsController.handle(
                assistResponse: .init(
                    model: .assist000,
                    request: "some request",
                    commands: [
                            .commandParsed(.init(
                            line: "",
                            type: .parsed,
                            name: "mock_command_return_argument",
                            args: []
                            ))
                    ]
                ),
                commandContext: .init(request: "blah")
            ) { confirmationMessage in true }
        } catch let e as CommandsController.CommandError {
            switch e {
            case .mismatchArgs(let reason):
                XCTAssertEqual(reason, "command expects 1 args but got 0")
                expectation.fulfill()
            default:
                throw e
            }
        }
        
        await waitForExpectations(timeout: 2)
    }

}
