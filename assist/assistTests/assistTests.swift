//
//  assistTests.swift
//  assistTests
//
//  Created by Nathan Kot on 31/12/22.
//

import XCTest
import assist
import BashiPlugin

final class assistTests: XCTestCase {

    override func setUpWithError() throws {
        // Put setup code here. This method is called before the invocation of each test method in the class.
    }

    override func tearDownWithError() throws {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }

    func testAppStateTransition() async throws {
        let state = await AppState()
        let expected = AppState.State.NeedsInput(
            messages: [],
            type: .Confirm(confirmationMessage: "some confirmation"))
        
        // t1 should happen first, despite it having a longer wait:
        let t1 = Task {
            try await state.transition(newState: .Processing(messages: [])) { doTransition in
                try await Task.sleep(nanoseconds: 1_000_000_000)
                await doTransition()
            }
        }
        
        let t2 = Task {
            try await Task.sleep(nanoseconds: 500_000_000   )
            try await state.transition(newState: expected)
        }
        
        try await t2.value
        try await t1.value
        
        let s = await state.state
        switch s {
        case .NeedsInput:
            break
        default:
            XCTFail("expected the state to be .Confirm")
        }
    }
    
    func testCompatWithServerDateFormat() throws {
        XCTAssertNotNil(BashiValue(.string("2022-12-20T12:00:00+09:00")).maybeAsDate)
        XCTAssertNotNil(BashiValue(.string("2022-12-20T12:00:00.000+09:00")).maybeAsDate)
        XCTAssertNotNil(BashiValue(.string("2022-12-20T12:00:00.000")).maybeAsDate)
        XCTAssertNotNil(BashiValue(.string("2022-12-20T12:00:00")).maybeAsDate)
        XCTAssertNotNil(BashiValue(.string("2022-12-20T12:00:00Z")).maybeAsDate)
    }

    func testPerformanceExample() throws {
        // This is an example of a performance test case.
        measure {
            // Put the code you want to measure the time of here.
        }
    }

}
