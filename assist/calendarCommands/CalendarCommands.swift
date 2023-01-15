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
    }

    static public var id: String = "calendarCommands"
    static public func makeBashiPlugin(api: PluginAPI) -> Plugin {
        return CalendarCommands()
    }

    let eventStore = EKEventStore()

    public func prepare() async throws {
        let granted: Bool = try await withCheckedThrowingContinuation { continuation in
            DispatchQueue.main.sync {
                eventStore.requestAccess(to: .event) { granted, err in
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
    }

    public func provideCommands() -> [Command] {
        return [
            AnonymousCommand(
                name: "createCalendarEvent",
                description: "create a calendar event for a certain date and time",
                args: [
                    .init(type: .string, name: "name"),
                    .init(type: .string, name: "natural language time relative to now", parsers: [.naturalLanguageDateTime]),
                    .init(type: .number, name: "duration in hours or 1 if unknown")
                ],
                triggerTokens: ["calendar", "event", "appointment", "meeting"],
                prepareFn: { (api, ctx, args, argsParsed) -> PreparedCommand? in
                    guard let name = args[0].string else {
                        logger.error("could not find calendar name")
                        return nil
                    }
                    guard let date = argsParsed?[1]["naturalLanguageDateTime"]?.maybeAsDate else {
                        logger.info("date time received was: \(argsParsed?[1]["naturalLanguageDateTime"]?.string ?? "")")
                        logger.error("could not find calendar date parsed from natural language date time")
                        return nil
                    }
                    guard let hours = args[2].number else {
                        logger.error("could not find calendar duration in hours")
                        return nil
                    }
                    guard let defaultCalendar = self.eventStore.defaultCalendarForNewEvents else {
                        return nil
                    }
                    
                    let event = EKEvent.init(eventStore: self.eventStore)
                    event.startDate = date
                    event.title = name
                    event.endDate = date.addingTimeInterval(60*60*hours.doubleValue)
                    event.calendar = defaultCalendar
                    
                    return AnonymousPreparedCommand(
                        shouldSkipConfirmation: false,
                        confirmationMessage: "Create this calendar event?") {
                            try self.eventStore.save(event, span: .thisEvent, commit: true)
                    }
                })
        ]
    }
    
}
