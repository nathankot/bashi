//
// Generated by SwagGen
// https://github.com/yonaskolb/SwagGen
//

import Foundation

public class NumberValue: APIModel {

    public enum `Type`: String, Codable, Equatable, CaseIterable {
        case number = "number"
    }

    public var type: `Type`

    public var value: Double

    public init(type: `Type`, value: Double) {
        self.type = type
        self.value = value
    }

    public required init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: StringCodingKey.self)

        type = try container.decode("type")
        value = try container.decode("value")
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: StringCodingKey.self)

        try container.encode(type, forKey: "type")
        try container.encode(value, forKey: "value")
    }

    public func isEqual(to object: Any?) -> Bool {
      guard let object = object as? NumberValue else { return false }
      guard self.type == object.type else { return false }
      guard self.value == object.value else { return false }
      return true
    }

    public static func == (lhs: NumberValue, rhs: NumberValue) -> Bool {
        return lhs.isEqual(to: rhs)
    }
}
