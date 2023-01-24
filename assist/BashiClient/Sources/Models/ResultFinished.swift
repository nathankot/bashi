//
// Generated by SwagGen
// https://github.com/yonaskolb/SwagGen
//

import Foundation

public class ResultFinished: APIModel {

    public enum `Type`: String, Codable, Equatable, CaseIterable {
        case finished = "finished"
    }

    public var type: `Type`

    public var resolvedCommands: [CommandExecuted]

    public init(type: `Type`, resolvedCommands: [CommandExecuted]) {
        self.type = type
        self.resolvedCommands = resolvedCommands
    }

    public required init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: StringCodingKey.self)

        type = try container.decode("type")
        resolvedCommands = try container.decodeArray("resolvedCommands")
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: StringCodingKey.self)

        try container.encode(type, forKey: "type")
        try container.encode(resolvedCommands, forKey: "resolvedCommands")
    }

    public func isEqual(to object: Any?) -> Bool {
      guard let object = object as? ResultFinished else { return false }
      guard self.type == object.type else { return false }
      guard self.resolvedCommands == object.resolvedCommands else { return false }
      return true
    }

    public static func == (lhs: ResultFinished, rhs: ResultFinished) -> Bool {
        return lhs.isEqual(to: rhs)
    }
}