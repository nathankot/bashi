//
// Generated by SwagGen
// https://github.com/yonaskolb/SwagGen
//

import Foundation

public class ModelsAssist000Input: APIModel {

    public var clarifications: [Clarifications]?

    public var request: String?

    public var requestContext: RequestContext?

    public class Clarifications: APIModel {

        public var question: String

        public var answer: String

        public init(question: String, answer: String) {
            self.question = question
            self.answer = answer
        }

        public required init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: StringCodingKey.self)

            question = try container.decode("question")
            answer = try container.decode("answer")
        }

        public func encode(to encoder: Encoder) throws {
            var container = encoder.container(keyedBy: StringCodingKey.self)

            try container.encode(question, forKey: "question")
            try container.encode(answer, forKey: "answer")
        }

        public func isEqual(to object: Any?) -> Bool {
          guard let object = object as? Clarifications else { return false }
          guard self.question == object.question else { return false }
          guard self.answer == object.answer else { return false }
          return true
        }

        public static func == (lhs: Clarifications, rhs: Clarifications) -> Bool {
            return lhs.isEqual(to: rhs)
        }
    }

    public init(clarifications: [Clarifications]? = nil, request: String? = nil, requestContext: RequestContext? = nil) {
        self.clarifications = clarifications
        self.request = request
        self.requestContext = requestContext
    }

    public required init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: StringCodingKey.self)

        clarifications = try container.decodeArrayIfPresent("clarifications")
        request = try container.decodeIfPresent("request")
        requestContext = try container.decodeIfPresent("requestContext")
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: StringCodingKey.self)

        try container.encodeIfPresent(clarifications, forKey: "clarifications")
        try container.encodeIfPresent(request, forKey: "request")
        try container.encodeIfPresent(requestContext, forKey: "requestContext")
    }

    public func isEqual(to object: Any?) -> Bool {
      guard let object = object as? ModelsAssist000Input else { return false }
      guard self.clarifications == object.clarifications else { return false }
      guard self.request == object.request else { return false }
      guard self.requestContext == object.requestContext else { return false }
      return true
    }

    public static func == (lhs: ModelsAssist000Input, rhs: ModelsAssist000Input) -> Bool {
        return lhs.isEqual(to: rhs)
    }
}
