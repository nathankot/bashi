//
//  BuiltinCommands.swift
//  builtinCommands
//
//  Created by Nathan Kot on 6/01/23.
//

import os
import Foundation
import BashiPlugin
import EventKit

let logger = Logger()

public class CalendarCommands: BundledPlugin {

    public enum ErrorType: Error {
        case noEventStorePermissions
        case internalError
        case noDefaultCalendar
    }

    static public var id: String = "calendarCommands"
    static public func makeBashiPlugin() -> BashiPluginProtocol {
        return CalendarCommands()
    }

    let eventStore = EKEventStore()

    public func prepare() async throws {
    }
    
    public func provideCommands() -> [Command] {
        return [
            AnonymousCommand(
                name: "createCalendarEvent",
                cost: .Low,
                description: "make calendar event for the given name, datetime and duration",
                args: [
                        .init(type: .string, name: "name"),
                        .init(type: .string, name: "iso8601Date"),
                        .init(type: .number, name: "event duration in hours")
                ],
                returnType: .void,
                triggerTokens: ["calendar", "event", "appointment", "meeting"],
                runFn: { (api, ctx, args) async throws -> BashiValue in
                    let granted: Bool = try await withCheckedThrowingContinuation { continuation in
                        DispatchQueue.main.sync {
                            self.eventStore.requestAccess(to: .event) { granted, err in
                                if let e = err {
                                    continuation.resume(with: .failure(e))
                                } else {
                                    continuation.resume(with: .success(granted))
                                }
                            }
                        }
                    }
                    if !granted {
                        throw ErrorType.noEventStorePermissions
                    }
                    
                    guard let name = args[0].string else {
                        logger.error("could not find calendar name")
                        throw ErrorType.internalError
                    }
                    guard let date = args[1].maybeAsDate else {
                        logger.info("date time received was: \(args[1].string ?? "")")
                        logger.error("could not find calendar date parsed from natural language date time")
                        throw ErrorType.internalError
                    }
                    guard let hours = args[2].number else {
                        logger.error("could not find calendar duration in hours")
                        throw ErrorType.internalError
                    }
                    guard let defaultCalendar = self.eventStore.defaultCalendarForNewEvents else {
                        throw ErrorType.noDefaultCalendar
                    }

                    let event = EKEvent.init(eventStore: self.eventStore)
                    event.startDate = date
                    event.title = name
                    event.endDate = date.addingTimeInterval(60 * 60 * hours.doubleValue)
                    event.calendar = defaultCalendar
                    
                    try self.eventStore.save(event, span: .thisEvent, commit: true)
                    return .init(.void)
                })
        ]
    }

}
