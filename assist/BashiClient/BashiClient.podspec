Pod::Spec.new do |s|
    s.source_files = '*.swift'
    s.name = 'BashiClient'
    s.authors = 'Nathan Kot'
    s.summary = 'TODO'
    s.version = '0.1.0'
    s.homepage = 'http://localhost'
    s.source = { :git => 'git@github.com:https://github.com/yonaskolb/SwagGen.git' }
    s.ios.deployment_target = '10.0'
    s.tvos.deployment_target = '10.0'
    s.osx.deployment_target = '10.12'
    s.source_files = 'Sources/**/*.swift'
    s.dependency 'Alamofire', '~> 5.4.4'
end
