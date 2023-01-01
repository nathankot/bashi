//
// PostSessionsRequestAllOfModelConfigurationsInner.swift
//
// Generated by openapi-generator
// https://openapi-generator.tech
//

import Foundation
#if canImport(AnyCodable)
import AnyCodable
#endif

public struct PostSessionsRequestAllOfModelConfigurationsInner: Codable, JSONEncodable, Hashable {

    public enum Model: String, Codable, CaseIterable {
        case passthroughOpenai000 = "passthrough-openai-000"
    }
    public var model: Model
    public var functions: [String: FunctionDefinition]

    public init(model: Model, functions: [String: FunctionDefinition]) {
        self.model = model
        self.functions = functions
    }

    public enum CodingKeys: String, CodingKey, CaseIterable {
        case model
        case functions
    }

    // Encodable protocol methods

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(model, forKey: .model)
        try container.encode(functions, forKey: .functions)
    }
}
