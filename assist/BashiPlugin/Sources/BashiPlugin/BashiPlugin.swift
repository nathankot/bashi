import os
import Foundation

@objc public protocol PluginAPI {
    @objc optional func setResultForTesting(text: String)
}

@objc public protocol Plugin {
    static var id: String { get }
    func prepare() async throws
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

@objc public enum CommandBuiltinAction: Int, Equatable {
    case display
}

@objc public enum CommandArgParser: Int, Equatable {
    case naturalLanguageDateTime
    
    func asString() -> String {
        switch self {
        case .naturalLanguageDateTime:
            return "naturalLanguageDateTime"
        }
    }
}

@objc public class CommandArgDef: NSObject {
    public let type: CommandArgType
    public let name: String
    public let parsers: [CommandArgParser]
    public init(type: CommandArgType, name: String, parsers: [CommandArgParser] = []) {
        self.name = name
        self.type = type
        self.parsers = parsers
    }
}

@objc public class CommandValue: NSObject {
    public private(set) var string: String? = nil
    public private(set) var number: NSNumber? = nil
    public private(set) var boolean: NSNumber? = nil
    
    public private(set) var type: CommandArgType
    
    override public var description: String {
        if let v = string {
            return v
        }
        if let v = number {
            return "\(v)"
        }
        if let v = boolean {
            return "\(v == 0 ? false : true)"
        }
        return "<unknown value>"
    }

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
    
    public var maybeAsDate: Date? {
        guard let s = string else { return nil }
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions.insert(.withFractionalSeconds)
        return formatter.date(from: s)
    }
}

@objc public protocol Command {
    var name: String { get }
    var description: String { get }
    var args: [CommandArgDef] { get }
    var triggerTokens: [String]? { get }
    func prepare(
        api: PluginAPI,
        context: CommandContext,
        args: [CommandValue],
        argsParsed: [Dictionary<String, CommandValue>]?
    ) -> PreparedCommand?
}

@objc public protocol PreparedCommand {
    var shouldSkipConfirmation: Bool { get }
    var confirmationMessage: String { get }
    func run() async throws
}

@objc public protocol CommandContext {
    var request: String { get }
    var requestContextStrings: Dictionary<String, String> { get }
    var requestContextNumbers: Dictionary<String, Double> { get }
    var requestContextBooleans: Dictionary<String, Bool> { get }

    func getReturnValues() async -> [CommandValue]
    func getErrors() async -> [Error]
    
    func append(returnValue: CommandValue) async
    func append(error: Error) async
    func append(builtinAction: CommandBuiltinAction) async
}

extension CommandContext {
    public func stringReturnValues() async -> [String] {
        return await getReturnValues().compactMap({ v in v.string })
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
    private let prepareFn: (
        PluginAPI,
        CommandContext,
        [CommandValue],
        [Dictionary<String, CommandValue>]?
    ) -> PreparedCommand?

    public init(
        name: String,
        description: String,
        args: [CommandArgDef] = [],
        triggerTokens: [String]? = nil,
        prepareFn: @escaping (
            PluginAPI,
            CommandContext,
            [CommandValue],
            [Dictionary<String, CommandValue>]?
        ) -> PreparedCommand?
    ) {
        self.name = name
        self.description = description
        self.args = args
        self.triggerTokens = triggerTokens
        self.prepareFn = prepareFn
    }

    public func prepare(
        api: PluginAPI,
        context: CommandContext,
        args: [CommandValue],
        argsParsed: [Dictionary<String, CommandValue>]?
    ) -> PreparedCommand? {
        return prepareFn(api, context, args, argsParsed)
    }
}

