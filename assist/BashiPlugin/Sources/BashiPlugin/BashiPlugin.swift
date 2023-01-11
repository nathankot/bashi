import os
import Foundation

@objc public protocol PluginAPI {
    @objc optional func setResultForTesting(text: String)
}

@objc public protocol Plugin {
    static var id: String { get }
    func provideCommands() -> [Command]
}

@objc public protocol BundledPlugin: Plugin {
    static func makeBashiPlugin(api: PluginAPI) -> any Plugin
}

@objc public enum CommandArgType: Int, Equatable {
    case string
    case number
    case boolean

    public func asString() -> String {
        switch self {
        case .string: return "string"
        case .boolean: return "boolean"
        case .number: return "number"
        }
    }
}

@objc public enum ReturnValuesHandling: Int, Equatable {
    case none
    case displayOnScreen
    case insertText
}

@objc public class CommandArgDef: NSObject {
    public let type: CommandArgType
    public let name: String
    public init(type: CommandArgType, name: String) {
        self.name = name
        self.type = type
    }
}

@objc public class CommandValue: NSObject {
    public private(set) var string: String? = nil
    public private(set) var number: NSNumber? = nil
    public private(set) var boolean: NSNumber? = nil
    
    public var type: CommandArgType

    public enum InitOption {
        case string(String)
        case number(Double)
        case boolean(Bool)
    }

    public init(_ option: InitOption) {
        switch option {
        case .string(let v):
            self.string = v
            self.type = .string
        case .boolean(let v):
            self.boolean = v ? 1 : 0
            self.type = .boolean
        case .number(let v):
            self.number = v as NSNumber
            self.type = .number
        }
    }
}

@objc public protocol Command {
    var name: String { get }
    var description: String { get }
    var args: [CommandArgDef] { get }
    var triggerTokens: [String]? { get }
    func prepare(api: PluginAPI, context: CommandContext, args: [CommandValue]) -> PreparedCommand?
}

@objc public protocol PreparedCommand {
    var shouldSkipConfirmation: Bool { get }
    var confirmationMessage: String { get }
    func run() async throws
}

@objc public protocol CommandContext {
    var requestContextStrings: Dictionary<String, String> { get }
    var requestContextNumbers: Dictionary<String, Double> { get }
    var requestContextBooleans: Dictionary<String, Bool> { get }

    var returnValuesHandling: ReturnValuesHandling { get set }
    var returnValues: [CommandValue] { get set }
    var error: Error? { get set }
}

extension CommandContext {
    public var stringReturnValues: [String] {
        return returnValues.compactMap({ v in v.string })
    }
}
public class AnonymousPreparedCommand: PreparedCommand {
    public let shouldSkipConfirmation: Bool
    public let confirmationMessage: String
    private let runFn: () async throws -> Void

    public init(
        shouldSkipConfirmation: Bool,
        confirmationMessage: String,
        runFn: @escaping () async throws -> Void
    ) {
        self.shouldSkipConfirmation = shouldSkipConfirmation
        self.confirmationMessage = confirmationMessage
        self.runFn = runFn
    }

    public func run() async throws {
        return try await runFn()
    }
}

public class AnonymousCommand: Command {
    public let name: String
    public let description: String
    public let args: [CommandArgDef]
    public let triggerTokens: [String]?
    private let prepareFn: (PluginAPI, CommandContext, [CommandValue]) -> PreparedCommand?

    public init(
        name: String,
        description: String,
        args: [CommandArgDef] = [],
        triggerTokens: [String]? = nil,
        prepareFn: @escaping (PluginAPI, CommandContext, [CommandValue]) -> PreparedCommand?
    ) {
        self.name = name
        self.description = description
        self.args = args
        self.triggerTokens = triggerTokens
        self.prepareFn = prepareFn
    }

    public func prepare(api: PluginAPI, context: CommandContext, args: [CommandValue]) -> PreparedCommand? {
        return prepareFn(api, context, args)
    }
}

