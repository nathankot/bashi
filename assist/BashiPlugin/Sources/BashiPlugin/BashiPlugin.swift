import os
import Foundation

@objc public protocol PluginAPI {
    func displayResult(text: String) async
}

@objc public protocol Plugin {
    static var id: String { get }
    static func makeBashiPlugin(api: PluginAPI) -> any Plugin
    func provideCommands() -> [Command]
}

@objc public protocol CommandArg {
    // should be 'string', 'number', or 'boolean'
    var type: String { get }
    var name: String { get }
}

@objc public protocol Command {
    var name: String { get }
    var description: String { get }
    var args: [CommandArg] { get }
    var triggerTokens: [String]? { get }
    func prepare(api: PluginAPI, context: CommandContext) -> PreparedCommand?
}

@objc public protocol PreparedCommand {
    var shouldSkipConfirmation: Bool { get }
    var confirmationMessage: String { get }
    func run(api: PluginAPI, context: CommandContext) async throws
}

@objc public protocol CommandContext {
    var requestContextStrings: Dictionary<String, String> { get }
    var requestContextNumbers: Dictionary<String, Double> { get }
    var requestContextBooleans: Dictionary<String, Bool> { get }

    var stringResult: String? { get set }
    var error: Error? { get set  }
}
