// swift-tools-version:5.2

import PackageDescription

let package = Package(
    name: "Bashi",
    platforms: [
        .macOS(.v10_12),
        .iOS(.v10),
        .tvOS(.v10),
        .watchOS(.v3)
    ],
    products: [
        .library(name: "Bashi", targets: ["Bashi"])
    ],
    dependencies: [
        .package(url: "https://github.com/Alamofire/Alamofire.git", .exact("5.4.4")),
    ],
    targets: [
        .target(name: "Bashi", dependencies: [
          "Alamofire",
        ], path: "Sources")
    ]
)
