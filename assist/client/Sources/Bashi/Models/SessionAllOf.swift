//
// SessionAllOf.swift
//
// Generated by openapi-generator
// https://openapi-generator.tech
//

import Foundation
#if canImport(AnyCodable)
import AnyCodable
#endif

public struct SessionAllOf: Codable, JSONEncodable, Hashable {

    public var accountNumber: String
    public var sessionId: String
    public var expiresAt: String
    public var configuration: SessionConfiguration
    public var modelConfigurations: [AnyOfmodelsAssist000ConfigurationobjectmodelsTranslate000ConfigurationmodelsCode000ConfigurationmodelsWhisper000ConfigurationmodelsPassthroughOpenai000Configuration]

    public init(accountNumber: String, sessionId: String, expiresAt: String, configuration: SessionConfiguration, modelConfigurations: [AnyOfmodelsAssist000ConfigurationobjectmodelsTranslate000ConfigurationmodelsCode000ConfigurationmodelsWhisper000ConfigurationmodelsPassthroughOpenai000Configuration]) {
        self.accountNumber = accountNumber
        self.sessionId = sessionId
        self.expiresAt = expiresAt
        self.configuration = configuration
        self.modelConfigurations = modelConfigurations
    }

    public enum CodingKeys: String, CodingKey, CaseIterable {
        case accountNumber
        case sessionId
        case expiresAt
        case configuration
        case modelConfigurations
    }

    // Encodable protocol methods

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(accountNumber, forKey: .accountNumber)
        try container.encode(sessionId, forKey: .sessionId)
        try container.encode(expiresAt, forKey: .expiresAt)
        try container.encode(configuration, forKey: .configuration)
        try container.encode(modelConfigurations, forKey: .modelConfigurations)
    }
}
