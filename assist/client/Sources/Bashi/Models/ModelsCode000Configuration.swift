//
// ModelsCode000Configuration.swift
//
// Generated by openapi-generator
// https://openapi-generator.tech
//

import Foundation
#if canImport(AnyCodable)
import AnyCodable
#endif

public struct ModelsCode000Configuration: Codable, JSONEncodable, Hashable {

    public enum Model: String, Codable, CaseIterable {
        case code000 = "code-000"
    }
    public var model: Model

    public init(model: Model) {
        self.model = model
    }

    public enum CodingKeys: String, CodingKey, CaseIterable {
        case model
    }

    // Encodable protocol methods

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(model, forKey: .model)
    }
}
