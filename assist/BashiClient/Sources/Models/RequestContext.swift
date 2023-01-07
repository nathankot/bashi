//
// Generated by SwagGen
// https://github.com/yonaskolb/SwagGen
//

import Foundation

public class RequestContext: APIModel {

    public var language: StringValue?

    public var text: StringValue?

    public var additionalProperties: [String: Value] = [:]

    public init(language: StringValue? = nil, text: StringValue? = nil) {
        self.language = language
        self.text = text
    }

    public required init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: StringCodingKey.self)

        language = try container.decodeIfPresent("language")
        text = try container.decodeIfPresent("text")

        let additionalPropertiesContainer = try decoder.container(keyedBy: StringCodingKey.self)
        var additionalProperties = try additionalPropertiesContainer.toDictionary()
        additionalProperties.removeValue(forKey: "language")
        additionalProperties.removeValue(forKey: "text")
        var decodedAdditionalProperties: [String: Value] = [:]
        for key in additionalProperties.keys {
            decodedAdditionalProperties[key] = try additionalPropertiesContainer.decode(StringCodingKey(string: key))
        }
        self.additionalProperties = decodedAdditionalProperties
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: StringCodingKey.self)

        try container.encodeIfPresent(language, forKey: "language")
        try container.encodeIfPresent(text, forKey: "text")

        var additionalPropertiesContainer = encoder.container(keyedBy: StringCodingKey.self)
        for (key, value) in additionalProperties {
            try additionalPropertiesContainer.encode(value, forKey: StringCodingKey(string: key))
        }
    }

    public subscript(key: String) -> Value? {
        get {
            return additionalProperties[key]
        }
        set {
            additionalProperties[key] = newValue
        }
    }

    public func isEqual(to object: Any?) -> Bool {
      guard let object = object as? RequestContext else { return false }
      guard self.language == object.language else { return false }
      guard self.text == object.text else { return false }
      guard NSDictionary(dictionary: self.additionalProperties).isEqual(to: object.additionalProperties) else { return false }
      return true
    }

    public static func == (lhs: RequestContext, rhs: RequestContext) -> Bool {
        return lhs.isEqual(to: rhs)
    }
}
