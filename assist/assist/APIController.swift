//
//  APIController.swift
//  assist
//
//  Created by Nathan Kot on 4/01/23.
//

import BashiClient
import Foundation

#if DEBUG
    import AlamofireNetworkActivityLogger
#endif

public actor APIController {

    let state: AppState
    let pluginsController: PluginsController

    public init(state: AppState, pluginsController: PluginsController) {
        self.state = state
        self.pluginsController = pluginsController
    }

    public func assist(input: ModelsAssist001Input) async throws -> ModelsAssist001Output {
        var session = await state.session
        if input.request != nil {
            // Only attempt to refresh the session if we are looking at a new request
            // (evidenced by the existence of the request field)
            session = try await refreshSession()
        }
        guard let session = session else {
            throw AppError.Internal("did not expect session to be nil")
        }
        let apiClient = await makeApiClient()
        let request = BashiClient.PostSessionAssist001.Request(
            body: input,
            options: .init(sessionID: session.sessionId))

        let response = await withCheckedContinuation { continuation in
            apiClient.makeRequest(request, complete: { response in
                continuation.resume(returning: response)
            })
        }

        let r = try response.result.get()

        switch r {
        case .status401(let e), .status403(let e):
            throw AppError.CouldNotAuthenticate(e.error)
        case .status400(let e):
            throw AppError.BadConfiguration(e.error)
        case .status200(let response):
            #if DEBUG
                let encoder = JSONEncoder()
                if let d = try? encoder.encode(response) {
                    logger.debug("raw response is: \(String(data: d, encoding: .utf8)!)")
                }
            #endif
            return response
        }
    }

    func refreshSession(force: Bool = false) async throws -> BashiSession {
        let timezone = TimeZone.current.identifier
        let locale = Locale.current.identifier(.bcp47)

        let commandDefinitions = await pluginsController.commandDefinitions
        let accountNumber = await state.accountNumber
        if !force {
            if let session = await state.session {
                if session.expiresAt.compare(Date().addingTimeInterval(-60 * 10)) == .orderedDescending &&
                    (
                        session.accountNumber,
                        session.configuration.timezoneName,
                        session.configuration.locale
                    ) == (
                        accountNumber,
                        timezone,
                        locale
                    ) {
                    // Nothing to do as the current session is still valid
                    // for at least another 10 minutes.
                    return session
                }
            }
        }

        let apiClient = await makeApiClient()
        let request = BashiClient.PostSessions.Request(
            body: .init(
                modelConfigurations: .init(
                    assist001: .init(
                        model: .assist001,
                        commands: commandDefinitions
                            .mapValues { $0.def.toAPIRepresentation() }
                    )),
                configuration: .init(
                    locale: locale,
                    timezoneName: timezone
                )
            )
        )
        let response = await withCheckedContinuation { continuation in
            apiClient.makeRequest(request, complete: { response in
                continuation.resume(returning: response)
            })
        }
        switch try response.result.get() {
        case .status401(let e), .status403(let e):
            throw AppError.CouldNotAuthenticate(e.error)
        case .status400(let e):
            throw AppError.BadConfiguration(e.error)
        case .status200(let success):
            #if DEBUG
                let encoder = JSONEncoder()
                if let d = try? encoder.encode(success) {
                    logger.debug("raw response is: \(String(data: d, encoding: .utf8)!)")
                }
            #endif
            await MainActor.run { state.session = success.session }
            return success.session
        }
    }

    func makeApiClient() async -> APIClient {
        #if DEBUG
            NetworkActivityLogger.shared.startLogging()
        #endif

        let accountNumber = await state.accountNumber
        let apiClient = APIClient(baseURL: BashiClient.Server.main, defaultHeaders: [
            "Authorization": "Bearer \(accountNumber)",
            ])

        apiClient.sessionManager.sessionConfiguration.timeoutIntervalForRequest = 5

        return apiClient
    }

}
