//
// Generated by SwagGen
// https://github.com/yonaskolb/SwagGen
//

import Foundation

public class BashiSession: APIModel {

    public var accountNumber: String

    public var sessionId: String

    public var expiresAt: String

    public var configuration: SessionConfiguration

    public var modelConfigurations: ModelConfigurations

    public var outputAwaitingContext: OutputAwaitingContext?

    public class ModelConfigurations: APIModel {

        public var assist000: ModelsAssist000Configuration?

        public var code000: ModelsCode000Configuration?

        public var noop: ModelsNoopConfiguration?

        public var passthroughOpenai000: ModelsPassthroughOpenai000Configuration?

        public var translate000: ModelsTranslate000Configuration?

        public var whisper000: ModelsWhisper000Configuration?

        public init(assist000: ModelsAssist000Configuration? = nil, code000: ModelsCode000Configuration? = nil, noop: ModelsNoopConfiguration? = nil, passthroughOpenai000: ModelsPassthroughOpenai000Configuration? = nil, translate000: ModelsTranslate000Configuration? = nil, whisper000: ModelsWhisper000Configuration? = nil) {
            self.assist000 = assist000
            self.code000 = code000
            self.noop = noop
            self.passthroughOpenai000 = passthroughOpenai000
            self.translate000 = translate000
            self.whisper000 = whisper000
        }

        public required init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: StringCodingKey.self)

            assist000 = try container.decodeIfPresent("assist-000")
            code000 = try container.decodeIfPresent("code-000")
            noop = try container.decodeIfPresent("noop")
            passthroughOpenai000 = try container.decodeIfPresent("passthrough-openai-000")
            translate000 = try container.decodeIfPresent("translate-000")
            whisper000 = try container.decodeIfPresent("whisper-000")
        }

        public func encode(to encoder: Encoder) throws {
            var container = encoder.container(keyedBy: StringCodingKey.self)

            try container.encodeIfPresent(assist000, forKey: "assist-000")
            try container.encodeIfPresent(code000, forKey: "code-000")
            try container.encodeIfPresent(noop, forKey: "noop")
            try container.encodeIfPresent(passthroughOpenai000, forKey: "passthrough-openai-000")
            try container.encodeIfPresent(translate000, forKey: "translate-000")
            try container.encodeIfPresent(whisper000, forKey: "whisper-000")
        }

        public func isEqual(to object: Any?) -> Bool {
          guard let object = object as? ModelConfigurations else { return false }
          guard self.assist000 == object.assist000 else { return false }
          guard self.code000 == object.code000 else { return false }
          guard self.noop == object.noop else { return false }
          guard self.passthroughOpenai000 == object.passthroughOpenai000 else { return false }
          guard self.translate000 == object.translate000 else { return false }
          guard self.whisper000 == object.whisper000 else { return false }
          return true
        }

        public static func == (lhs: ModelConfigurations, rhs: ModelConfigurations) -> Bool {
            return lhs.isEqual(to: rhs)
        }
    }

    public init(accountNumber: String, sessionId: String, expiresAt: String, configuration: SessionConfiguration, modelConfigurations: ModelConfigurations, outputAwaitingContext: OutputAwaitingContext? = nil) {
        self.accountNumber = accountNumber
        self.sessionId = sessionId
        self.expiresAt = expiresAt
        self.configuration = configuration
        self.modelConfigurations = modelConfigurations
        self.outputAwaitingContext = outputAwaitingContext
    }

    public required init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: StringCodingKey.self)

        accountNumber = try container.decode("accountNumber")
        sessionId = try container.decode("sessionId")
        expiresAt = try container.decode("expiresAt")
        configuration = try container.decode("configuration")
        modelConfigurations = try container.decode("modelConfigurations")
        outputAwaitingContext = try container.decodeIfPresent("outputAwaitingContext")
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: StringCodingKey.self)

        try container.encode(accountNumber, forKey: "accountNumber")
        try container.encode(sessionId, forKey: "sessionId")
        try container.encode(expiresAt, forKey: "expiresAt")
        try container.encode(configuration, forKey: "configuration")
        try container.encode(modelConfigurations, forKey: "modelConfigurations")
        try container.encodeIfPresent(outputAwaitingContext, forKey: "outputAwaitingContext")
    }

    public func isEqual(to object: Any?) -> Bool {
      guard let object = object as? BashiSession else { return false }
      guard self.accountNumber == object.accountNumber else { return false }
      guard self.sessionId == object.sessionId else { return false }
      guard self.expiresAt == object.expiresAt else { return false }
      guard self.configuration == object.configuration else { return false }
      guard self.modelConfigurations == object.modelConfigurations else { return false }
      guard self.outputAwaitingContext == object.outputAwaitingContext else { return false }
      return true
    }

    public static func == (lhs: BashiSession, rhs: BashiSession) -> Bool {
        return lhs.isEqual(to: rhs)
    }
}
