//
// ModelsAssist000OutputAnyOf.swift
//
// Generated by openapi-generator
// https://openapi-generator.tech
//

import Foundation
#if canImport(AnyCodable)
import AnyCodable
#endif

public struct ModelsAssist000OutputAnyOf: Codable, JSONEncodable, Hashable {

    public enum Model: String, Codable, CaseIterable {
        case assist000 = "assist-000"
    }
    public var model: Model
    public var request: String
    public var functionCalls: [AnyOfobjectobjectAnyTypeobject]

    public init(model: Model, request: String, functionCalls: [AnyOfobjectobjectAnyTypeobject]) {
        self.model = model
        self.request = request
        self.functionCalls = functionCalls
    }

    public enum CodingKeys: String, CodingKey, CaseIterable {
        case model
        case request
        case functionCalls
    }

    // Encodable protocol methods

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(model, forKey: .model)
        try container.encode(request, forKey: .request)
        try container.encode(functionCalls, forKey: .functionCalls)
    }
}

