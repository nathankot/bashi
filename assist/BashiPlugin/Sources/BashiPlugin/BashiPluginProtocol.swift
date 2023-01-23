import os
import Foundation

@objc public protocol BashiPluginAPI {
    @objc func flush(message: String) async
}

@objc public protocol BashiPluginProtocol {
    static var id: String { get }
    func prepare() async throws
    func provideCommands() -> [Command]
}

@objc public protocol BundledPlugin: BashiPluginProtocol {
    static func makeBashiPlugin() -> any BashiPluginProtocol
}

@objc public enum BashiValueType: Int, Equatable {
    case string
    case number
    case boolean
    case void

    public func asString() -> String {
        switch self {
        case .string: return "string"
        case .boolean: return "boolean"
        case .number: return "number"
        case .void: return "void"
        }
    }
}


@objc public class CommandArgDef: NSObject {
    public let type: BashiValueType
    public let name: String
    public init(type: BashiValueType, name: String) {
        self.name = name
        self.type = type
    }
}

@objc public class BashiValue: NSObject {
    public private(set) var string: String? = nil
    public private(set) var number: NSNumber? = nil
    public private(set) var boolean: NSNumber? = nil
    
    public private(set) var type: BashiValueType
    
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
        if type == .void {
            return "void"
        }
        return "<unknown value>"
    }

    public enum InitOption {
        case string(String)
        case number(Double)
        case boolean(Bool)
        case void
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
        case .void:
            self.type = .void
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
    var returnType: BashiValueType { get }
    func prepare(
        api: BashiPluginAPI,
        context: CommandContext,
        args: [BashiValue],
        argsParsed: [Dictionary<String, BashiValue>]?
    ) -> PreparedCommand?
}

@objc public protocol PreparedCommand {
    var shouldSkipConfirmation: Bool { get }
    var confirmationMessage: String { get }
    // Other fields to support confirmation can be added here, such
    // as confirmation display layout, image etc.
    func run() async throws -> BashiValue
}

@objc public protocol CommandContext {
    var request: String { get }
    var requestContextStrings: Dictionary<String, String> { get }
    var requestContextNumbers: Dictionary<String, Double> { get }
    var requestContextBooleans: Dictionary<String, Bool> { get }
}

public class AnonymousPreparedCommand: PreparedCommand {
    public let shouldSkipConfirmation: Bool
    public let confirmationMessage: String
    private let runFn: () async throws -> BashiValue

    public init(
        shouldSkipConfirmation: Bool,
        confirmationMessage: String,
        runFn: @escaping () async throws -> BashiValue
    ) {
        self.shouldSkipConfirmation = shouldSkipConfirmation
        self.confirmationMessage = confirmationMessage
        self.runFn = runFn
    }

    public func run() async throws -> BashiValue {
        return try await runFn()
    }
}

public class AnonymousCommand: Command {
    public let name: String
    public let description: String
    public let args: [CommandArgDef]
    public var returnType: BashiValueType
    public let triggerTokens: [String]?
    private let prepareFn: (
        BashiPluginAPI,
        CommandContext,
        [BashiValue],
        [Dictionary<String, BashiValue>]?
    ) -> PreparedCommand?

    public init(
        name: String,
        description: String,
        args: [CommandArgDef] = [],
        returnType: BashiValueType = .void,
        triggerTokens: [String]? = nil,
        prepareFn: @escaping (
            BashiPluginAPI,
            CommandContext,
            [BashiValue],
            [Dictionary<String, BashiValue>]?
        ) -> PreparedCommand?
    ) {
        self.name = name
        self.description = description
        self.args = args
        self.returnType = returnType
        self.triggerTokens = triggerTokens
        self.prepareFn = prepareFn
    }

    public func prepare(
        api: BashiPluginAPI,
        context: CommandContext,
        args: [BashiValue],
        argsParsed: [Dictionary<String, BashiValue>]?
    ) -> PreparedCommand? {
        return prepareFn(api, context, args, argsParsed)
    }
}

