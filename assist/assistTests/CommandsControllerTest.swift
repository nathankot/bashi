//
//  CommandsControllerTest.swift
//
//
//  Created by Nathan Kot on 9/01/23.
//

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
            requestContext: .init()
        ) { confirmationMessage in true }

        XCTAssertEqual(resultContext.returnValues.map({ $0.string ?? "" }), ["some result B"])
        XCTAssertEqual(pluginAPI.seenResults, ["some result A"])
    }

    func testCommandNotConfirmed() async throws {
    }
    
    func testCommandNotConfirmedButSkipsConfirmation() async throws {
    }
    
    func testWrongArgumentType() async throws {}
    func testWrongArgumentNumberOfArguments() async throws {}

}
