//
// Generated by SwagGen
// https://github.com/yonaskolb/SwagGen
//

import Foundation

extension Bashi {

    /** TODO */
    public enum PostSessions {

        public static let service = APIService<Response>(id: "post_sessions", tag: "", method: "POST", path: "/sessions", hasBody: true, securityRequirements: [SecurityRequirement(type: "account_number", scopes: [])])

        public final class Request: APIRequest<Response> {

            /** TODO */
            public class Body: APIModel {

                public var modelConfigurations: ModelConfigurations

                public var configuration: SessionConfiguration?

                /** TODO */
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

                public init(modelConfigurations: ModelConfigurations, configuration: SessionConfiguration? = nil) {
                    self.modelConfigurations = modelConfigurations
                    self.configuration = configuration
                }

                public required init(from decoder: Decoder) throws {
                    let container = try decoder.container(keyedBy: StringCodingKey.self)

                    modelConfigurations = try container.decode("modelConfigurations")
                    configuration = try container.decodeIfPresent("configuration")
                }

                public func encode(to encoder: Encoder) throws {
                    var container = encoder.container(keyedBy: StringCodingKey.self)

                    try container.encode(modelConfigurations, forKey: "modelConfigurations")
                    try container.encodeIfPresent(configuration, forKey: "configuration")
                }

                public func isEqual(to object: Any?) -> Bool {
                  guard let object = object as? Body else { return false }
                  guard self.modelConfigurations == object.modelConfigurations else { return false }
                  guard self.configuration == object.configuration else { return false }
                  return true
                }

                public static func == (lhs: Body, rhs: Body) -> Bool {
                    return lhs.isEqual(to: rhs)
                }
            }

            public var body: Body?

            public init(body: Body?, encoder: RequestEncoder? = nil) {
                self.body = body
                super.init(service: PostSessions.service) { defaultEncoder in
                    return try (encoder ?? defaultEncoder).encode(body)
                }
            }
        }

        public enum Response: APIResponseValue, CustomStringConvertible, CustomDebugStringConvertible {

            /** TODO */
            public class Status200: APIModel {

                public var session: BashiSession

                public var builtinFunctions: [String: FunctionDefinition]

                public init(session: BashiSession, builtinFunctions: [String: FunctionDefinition]) {
                    self.session = session
                    self.builtinFunctions = builtinFunctions
                }

                public required init(from decoder: Decoder) throws {
                    let container = try decoder.container(keyedBy: StringCodingKey.self)

                    session = try container.decode("session")
                    builtinFunctions = try container.decode("builtinFunctions")
                }

                public func encode(to encoder: Encoder) throws {
                    var container = encoder.container(keyedBy: StringCodingKey.self)

                    try container.encode(session, forKey: "session")
                    try container.encode(builtinFunctions, forKey: "builtinFunctions")
                }

                public func isEqual(to object: Any?) -> Bool {
                  guard let object = object as? Status200 else { return false }
                  guard self.session == object.session else { return false }
                  guard self.builtinFunctions == object.builtinFunctions else { return false }
                  return true
                }

                public static func == (lhs: Status200, rhs: Status200) -> Bool {
                    return lhs.isEqual(to: rhs)
                }
            }
            public typealias SuccessType = Status200

            /** TODO */
            case status200(Status200)

            /** TODO */
            case status400(ErrorType)

            /** TODO */
            case status401(ErrorType)

            /** TODO */
            case status403(ErrorType)

            public var success: Status200? {
                switch self {
                case .status200(let response): return response
                default: return nil
                }
            }

            public var failure: ErrorType? {
                switch self {
                case .status400(let response): return response
                case .status401(let response): return response
                case .status403(let response): return response
                default: return nil
                }
            }

            /// either success or failure value. Success is anything in the 200..<300 status code range
            public var responseResult: APIResponseResult<Status200, ErrorType> {
                if let successValue = success {
                    return .success(successValue)
                } else if let failureValue = failure {
                    return .failure(failureValue)
                } else {
                    fatalError("Response does not have success or failure response")
                }
            }

            public var response: Any {
                switch self {
                case .status200(let response): return response
                case .status400(let response): return response
                case .status401(let response): return response
                case .status403(let response): return response
                }
            }

            public var statusCode: Int {
                switch self {
                case .status200: return 200
                case .status400: return 400
                case .status401: return 401
                case .status403: return 403
                }
            }

            public var successful: Bool {
                switch self {
                case .status200: return true
                case .status400: return false
                case .status401: return false
                case .status403: return false
                }
            }

            public init(statusCode: Int, data: Data, decoder: ResponseDecoder) throws {
                switch statusCode {
                case 200: self = try .status200(decoder.decode(Status200.self, from: data))
                case 400: self = try .status400(decoder.decode(ErrorType.self, from: data))
                case 401: self = try .status401(decoder.decode(ErrorType.self, from: data))
                case 403: self = try .status403(decoder.decode(ErrorType.self, from: data))
                default: throw APIClientError.unexpectedStatusCode(statusCode: statusCode, data: data)
                }
            }

            public var description: String {
                return "\(statusCode) \(successful ? "success" : "failure")"
            }

            public var debugDescription: String {
                var string = description
                let responseString = "\(response)"
                if responseString != "()" {
                    string += "\n\(responseString)"
                }
                return string
            }
        }
    }
}
