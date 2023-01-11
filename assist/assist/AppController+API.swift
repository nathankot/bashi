//
//  AppController+API.swift
//  assist
//
//  Created by Nathan Kot on 4/01/23.
//

import BashiClient
import Foundation

#if DEBUG
import AlamofireNetworkActivityLogger
#endif

extension AppController {
    
    func assist(request: String, requestContext: RequestContext) async throws -> ModelsAssist000Output {
       let session = try await refreshSession()
       let apiClient = await makeApiClient()
       let request = BashiClient.PostSessionAssist000.Request(
        body: .init(request: request, requestContext: requestContext),
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
           return response
       }
    }
    
    func refreshSession(force: Bool = false) async throws -> BashiSession {
        let accountNumber = await state.accountNumber
        if !force {
            if let session = await state.session {
                if session.expiresAt.compare(Date().addingTimeInterval(-60*10)) == .orderedDescending &&
                    session.accountNumber == accountNumber {
                    // Nothing to do as the current session is still valid
                    // for at least another 10 minutes.
                    return session
                }
            }
        }
        
        let apiClient = await makeApiClient()
        let request = BashiClient.PostSessions.Request(
            body: .init(modelConfigurations: .init(
                assist000: .init(model: .assist000, commands: [:])))
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
