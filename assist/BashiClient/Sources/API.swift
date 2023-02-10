//
// Generated by SwagGen
// https://github.com/yonaskolb/SwagGen
//

import Foundation

/** TODO */
public struct BashiClient {

    /// Whether to discard any errors when decoding optional properties
    public static var safeOptionalDecoding = false

    /// Whether to remove invalid elements instead of throwing when decoding arrays
    public static var safeArrayDecoding = false

    /// Used to encode Dates when uses as string params
    public static var dateEncodingFormatter = DateFormatter(formatString: "yyyy-MM-dd'T'HH:mm:ssZZZZZ",
                                                            locale: Locale(identifier: "en_US_POSIX"),
                                                            calendar: Calendar(identifier: .gregorian))

    public static let version = "0.1.0"


    public enum Server {

        /** Local development server **/
        public static let main = "http://localhost:8003/api"
    }
}
