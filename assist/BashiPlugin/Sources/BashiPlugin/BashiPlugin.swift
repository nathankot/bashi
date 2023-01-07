import Foundation

@objc public protocol PluginAPI {
    
}

@objc public protocol CommandContext {
    var requestContext: Dictionary<String, String> { get }
    
}

@objc public protocol CommandResult {
    var shouldSkipConfirmation: Bool { get }
    var confirmationMessage: String { get }
    
    func run(context: CommandContext) async throws // TODO -> return something?
    // TODO lots of things to represent in the return value here:
    //
    // * [x] how to allow the user to confirm an action first?
    // * [x] how to describe what action is going to be taken / has been taken?
    // * how to provide information into the context for downstream commands?
}

public class AnonymousCommandResult: CommandResult {
    public let shouldSkipConfirmation: Bool
    public let confirmationMessage: String
    private let run: (CommandContext) async throws -> Void
    
    public init(shouldSkipConfirmation: Bool, confirmationMessage: String, run: @escaping (CommandContext) -> Void) {
        self.shouldSkipConfirmation = shouldSkipConfirmation
        self.confirmationMessage = confirmationMessage
        self.run = run
    }
    
    public func run(context: CommandContext) async throws {
        try await run(context)
    }
}


@objc public protocol Plugin {
    @objc static var id: String { get }
    @objc static func makeBashiPlugin(api: PluginAPI) -> any Plugin
    
    @objc func process(command: String, context: CommandContext) async -> CommandResult
    
}

