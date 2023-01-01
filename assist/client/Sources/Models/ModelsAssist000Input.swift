//
// Generated by SwagGen
// https://github.com/yonaskolb/SwagGen
//

import Foundation

public class ModelsAssist000Input: APIModel {

    public var request: String?

    public var requestContext: RequestContext?

    public class RequestContext: APIModel {

        public var language: String?

        public var text: String?

        public init(language: String? = nil, text: String? = nil) {
            self.language = language
            self.text = text
        }

        public required init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: StringCodingKey.self)

            language = try container.decodeIfPresent("language")
            text = try container.decodeIfPresent("text")
        }

        public func encode(to encoder: Encoder) throws {
            var container = encoder.container(keyedBy: StringCodingKey.self)

            try container.encodeIfPresent(language, forKey: "language")
            try container.encodeIfPresent(text, forKey: "text")
        }

        public func isEqual(to object: Any?) -> Bool {
          guard let object = object as? RequestContext else { return false }
          guard self.language == object.language else { return false }
          guard self.text == object.text else { return false }
          return true
        }

        public static func == (lhs: RequestContext, rhs: RequestContext) -> Bool {
            return lhs.isEqual(to: rhs)
        }
    }

    public init(request: String? = nil, requestContext: RequestContext? = nil) {
        self.request = request
        self.requestContext = requestContext
    }

    public required init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: StringCodingKey.self)

        request = try container.decodeIfPresent("request")
        requestContext = try container.decodeIfPresent("requestContext")
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: StringCodingKey.self)

        try container.encodeIfPresent(request, forKey: "request")
        try container.encodeIfPresent(requestContext, forKey: "requestContext")
    }

    public func isEqual(to object: Any?) -> Bool {
      guard let object = object as? ModelsAssist000Input else { return false }
      guard self.request == object.request else { return false }
      guard self.requestContext == object.requestContext else { return false }
      return true
    }

    public static func == (lhs: ModelsAssist000Input, rhs: ModelsAssist000Input) -> Bool {
        return lhs.isEqual(to: rhs)
    }
}