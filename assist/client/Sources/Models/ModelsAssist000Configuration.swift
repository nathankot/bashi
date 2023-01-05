//
// Generated by SwagGen
// https://github.com/yonaskolb/SwagGen
//

import Foundation

public class ModelsAssist000Configuration: APIModel {

    public enum Model: String, Codable, Equatable, CaseIterable {
        case assist000 = "assist-000"
    }

    public var model: Model

    public var commands: [String: FunctionDefinition]

    public init(model: Model, commands: [String: FunctionDefinition]) {
        self.model = model
        self.commands = commands
    }

    public required init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: StringCodingKey.self)

        model = try container.decode("model")
        commands = try container.decode("commands")
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: StringCodingKey.self)

        try container.encode(model, forKey: "model")
        try container.encode(commands, forKey: "commands")
    }

    public func isEqual(to object: Any?) -> Bool {
      guard let object = object as? ModelsAssist000Configuration else { return false }
      guard self.model == object.model else { return false }
      guard self.commands == object.commands else { return false }
      return true
    }

    public static func == (lhs: ModelsAssist000Configuration, rhs: ModelsAssist000Configuration) -> Bool {
        return lhs.isEqual(to: rhs)
    }
}
