//
// Generated by SwagGen
// https://github.com/yonaskolb/SwagGen
//

import Foundation

public class AssistResultNeedsClarification: APIModel {

    public enum `Type`: String, Codable, Equatable, CaseIterable {
        case needsClarification = "needs_clarification"
    }

    public var type: `Type`

    public var clarificationQuestions: [String]

    public init(type: `Type`, clarificationQuestions: [String]) {
        self.type = type
        self.clarificationQuestions = clarificationQuestions
    }

    public required init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: StringCodingKey.self)

        type = try container.decode("type")
        clarificationQuestions = try container.decodeArray("clarificationQuestions")
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: StringCodingKey.self)

        try container.encode(type, forKey: "type")
        try container.encode(clarificationQuestions, forKey: "clarificationQuestions")
    }

    public func isEqual(to object: Any?) -> Bool {
      guard let object = object as? AssistResultNeedsClarification else { return false }
      guard self.type == object.type else { return false }
      guard self.clarificationQuestions == object.clarificationQuestions else { return false }
      return true
    }

    public static func == (lhs: AssistResultNeedsClarification, rhs: AssistResultNeedsClarification) -> Bool {
        return lhs.isEqual(to: rhs)
    }
}