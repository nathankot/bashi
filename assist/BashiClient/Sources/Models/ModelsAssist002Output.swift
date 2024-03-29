//
// Generated by SwagGen
// https://github.com/yonaskolb/SwagGen
//

import Foundation

public class ModelsAssist002Output: APIModel {

    public enum Model: String, Codable, Equatable, CaseIterable {
        case assist002 = "assist-002"
    }

    public var model: Model

    public var request: String

    public var result: ResultPendingCommands

    public init(model: Model, request: String, result: ResultPendingCommands) {
        self.model = model
        self.request = request
        self.result = result
    }

    public required init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: StringCodingKey.self)

        model = try container.decode("model")
        request = try container.decode("request")
        result = try container.decode("result")
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: StringCodingKey.self)

        try container.encode(model, forKey: "model")
        try container.encode(request, forKey: "request")
        try container.encode(result, forKey: "result")
    }

    public func isEqual(to object: Any?) -> Bool {
      guard let object = object as? ModelsAssist002Output else { return false }
      guard self.model == object.model else { return false }
      guard self.request == object.request else { return false }
      guard self.result == object.result else { return false }
      return true
    }

    public static func == (lhs: ModelsAssist002Output, rhs: ModelsAssist002Output) -> Bool {
        return lhs.isEqual(to: rhs)
    }
}
