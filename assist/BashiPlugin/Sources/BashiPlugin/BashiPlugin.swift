import os
import Foundation

@objc public protocol PluginAPI {
}

@objc public protocol Plugin {
    static var id: String { get }
    static func makeBashiPlugin(api: PluginAPI) -> any Plugin
    func provideCommands() -> [Command]
}

@objc public protocol Command {
    var name: String { get }
    func shouldRunBefore(otherCommand: Command) -> Bool
    func prepare(api: PluginAPI, context: CommandContext) -> PreparedCommand?
}

@objc public protocol PreparedCommand {
    var shouldSkipConfirmation: Bool { get }
    var confirmationMessage: String { get }
    func run(api: PluginAPI, context: CommandContext) async throws -> CommandContext
}

@objc public protocol CommandContext {
    var requestContextStrings: Dictionary<String, String> { get }
    var requestContextNumbers: Dictionary<String, Double> { get }
    var requestContextBooleans: Dictionary<String, Bool> { get }

    var stringResult: String? { get }
}
