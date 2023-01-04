//
// Generated by SwagGen
// https://github.com/yonaskolb/SwagGen
//

import Foundation

public enum FunctionCall: Codable, Equatable {
    case functionCallParseError(FunctionCallParseError)
    case functionCallInvalid(FunctionCallInvalid)
    case functionCallParsed(FunctionCallParsed)
    case functionCallExecuted(FunctionCallExecuted)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: StringCodingKey.self)
        let discriminator: String = try container.decode("type")
        switch discriminator {
        case "executed":
            self = .functionCallExecuted(try FunctionCallExecuted(from: decoder))
        case "invalid":
            self = .functionCallInvalid(try FunctionCallInvalid(from: decoder))
        case "parse_error":
            self = .functionCallParseError(try FunctionCallParseError(from: decoder))
        case "parsed":
            self = .functionCallParsed(try FunctionCallParsed(from: decoder))
        default:
            throw DecodingError.dataCorrupted(DecodingError.Context.init(codingPath: decoder.codingPath, debugDescription: "Couldn't find type to decode with discriminator \(discriminator)"))
        }
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch self {
        case .functionCallParseError(let content):
            try container.encode(content)
        case .functionCallInvalid(let content):
            try container.encode(content)
        case .functionCallParsed(let content):
            try container.encode(content)
        case .functionCallExecuted(let content):
            try container.encode(content)
        }
    }
}
