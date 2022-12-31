//
// PostSessionsRequestAllOf.swift
//
// Generated by openapi-generator
// https://openapi-generator.tech
//

import Foundation
#if canImport(AnyCodable)
import AnyCodable
#endif

public struct PostSessionsRequestAllOf: Codable, JSONEncodable, Hashable {

    public var modelConfigurations: [PostSessionsRequestAllOfModelConfigurationsInner]

    public init(modelConfigurations: [PostSessionsRequestAllOfModelConfigurationsInner]) {
        self.modelConfigurations = modelConfigurations
    }

    public enum CodingKeys: String, CodingKey, CaseIterable {
        case modelConfigurations
    }

    // Encodable protocol methods

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(modelConfigurations, forKey: .modelConfigurations)
    }
}

