//
// Generated by SwagGen
// https://github.com/yonaskolb/SwagGen
//

import Foundation

public class ErrorValue: APIModel {

    public enum `Type`: String, Codable, Equatable, CaseIterable {
        case error = "error"
    }

    public var type: `Type`

    public var message: String

    public init(type: `Type`, message: String) {
        self.type = type
        self.message = message
    }

    public required init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: StringCodingKey.self)

        type = try container.decode("type")
        message = try container.decode("message")
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: StringCodingKey.self)

        try container.encode(type, forKey: "type")
        try container.encode(message, forKey: "message")
    }

    public func isEqual(to object: Any?) -> Bool {
      guard let object = object as? ErrorValue else { return false }
      guard self.type == object.type else { return false }
      guard self.message == object.message else { return false }
      return true
    }

    public static func == (lhs: ErrorValue, rhs: ErrorValue) -> Bool {
        return lhs.isEqual(to: rhs)
    }
}
