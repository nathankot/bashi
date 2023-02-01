import os
import Foundation

@objc public protocol BashiPluginAPI {
    @objc func respond(message: String) async throws
    @objc func ask(question: String) async throws -> String
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
        let fracFormatter = ISO8601DateFormatter()
        fracFormatter.formatOptions.insert(.withFractionalSeconds)

        let localFormatter = DateFormatter()
        localFormatter.calendar = Calendar(identifier: .iso8601)
        localFormatter.locale = Locale.current
        localFormatter.timeZone = TimeZone.current
        localFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"

        let fraclocalFormatter = DateFormatter()
        fraclocalFormatter.calendar = Calendar(identifier: .iso8601)
        fraclocalFormatter.locale = Locale.current
        fraclocalFormatter.timeZone = TimeZone.current
        fraclocalFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS"
        
        for parse in [
            formatter.date,
            fracFormatter.date,
            localFormatter.date,
            fraclocalFormatter.date] {
            if let d = parse(s) {
                return d
            }
        }
        return nil
    }
}

@objc public enum CommandCost : Int {
    case Low = -100
    case Medium = 0
    case High = 1000
}

@objc public protocol Command {
    var name: String { get }
    var cost: CommandCost { get }
    var description: String { get }
    var args: [CommandArgDef] { get }
    var triggerTokens: [String]? { get }
    var returnType: BashiValueType { get }
    func run(
        api: BashiPluginAPI,
        context: CommandContext,
        args: [BashiValue]
    ) async throws -> BashiValue
}

@objc public protocol CommandContext {
    var request: String { get }
    var requestContextStrings: Dictionary<String, String> { get }
    var requestContextNumbers: Dictionary<String, Double> { get }
    var requestContextBooleans: Dictionary<String, Bool> { get }
}

public class AnonymousCommand: Command {
    public let name: String
    public let cost: CommandCost
    public let description: String
    public let args: [CommandArgDef]
    public var returnType: BashiValueType
    public let triggerTokens: [String]?
    private let runFn: (
        BashiPluginAPI,
        CommandContext,
        [BashiValue]
    ) async throws -> BashiValue

    public init(
        name: String,
        cost: CommandCost,
        description: String,
        args: [CommandArgDef] = [],
        returnType: BashiValueType,
        triggerTokens: [String]? = nil,
        runFn: @escaping (
            BashiPluginAPI,
            CommandContext,
            [BashiValue]
        ) async throws -> BashiValue
    ) {
        self.name = name
        self.cost = cost
        self.description = description
        self.args = args
        self.returnType = returnType
        self.triggerTokens = triggerTokens
        self.runFn = runFn
    }

    public func run(
        api: BashiPluginAPI,
        context: CommandContext,
        args: [BashiValue]
    ) async throws -> BashiValue {
        return try await runFn(api, context, args)
    }
}

