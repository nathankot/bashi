//
// FunctionDefinitionAllOf1.swift
//
// Generated by openapi-generator
// https://openapi-generator.tech
//

import Foundation
#if canImport(AnyCodable)
import AnyCodable
#endif

public struct FunctionDefinitionAllOf1: Codable, JSONEncodable, Hashable {

    public var triggerTokens: [String]?

    public init(triggerTokens: [String]? = nil) {
        self.triggerTokens = triggerTokens
    }

    public enum CodingKeys: String, CodingKey, CaseIterable {
        case triggerTokens
    }

    // Encodable protocol methods

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encodeIfPresent(triggerTokens, forKey: .triggerTokens)
    }
}
