//
// Generated by SwagGen
// https://github.com/yonaskolb/SwagGen
//

import Foundation

extension Bashi {

    /** TODO */
    public enum PostSessionWhisper000 {

        public static let service = APIService<Response>(id: "post_session_whisper-000", tag: "", method: "POST", path: "/session/requests/whisper-000", hasBody: true, securityRequirements: [SecurityRequirement(type: "account_number", scopes: [])])

        public final class Request: APIRequest<Response> {

            public struct Options {

                /** A session_id retrieved from POST /sessions */
                public var sessionID: String

                public init(sessionID: String) {
                    self.sessionID = sessionID
                }
            }

            public var options: Options

            public init(options: Options) {
                self.options = options
                super.init(service: PostSessionWhisper000.service)
            }

            /// convenience initialiser so an Option doesn't have to be created
            public convenience init(sessionID: String) {
                let options = Options(sessionID: sessionID)
                self.init(options: options)
            }

            override var headerParameters: [String: String] {
                var headers: [String: String] = [:]
                headers["Session-ID"] = options.sessionID
                return headers
            }
        }

        public enum Response: APIResponseValue, CustomStringConvertible, CustomDebugStringConvertible {
            public typealias SuccessType = ModelsWhisper000Output

            /** TODO */
            case status200(ModelsWhisper000Output)

            /** TODO */
            case status400(ErrorType)

            /** TODO */
            case status401(ErrorType)

            /** TODO */
            case status403(ErrorType)

            public var success: ModelsWhisper000Output? {
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
            public var responseResult: APIResponseResult<ModelsWhisper000Output, ErrorType> {
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
                case 200: self = try .status200(decoder.decode(ModelsWhisper000Output.self, from: data))
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
