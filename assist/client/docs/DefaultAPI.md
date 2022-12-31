# DefaultAPI

All URIs are relative to *http://localhost:8080/api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**postSessionAssist000**](DefaultAPI.md#postsessionassist000) | **POST** /session/requests/assist-000 | TODO
[**postSessionCode000**](DefaultAPI.md#postsessioncode000) | **POST** /session/requests/code-000 | TODO
[**postSessionNoop**](DefaultAPI.md#postsessionnoop) | **POST** /session/requests/noop | TODO
[**postSessionPassthroughOpenai000**](DefaultAPI.md#postsessionpassthroughopenai000) | **POST** /session/requests/passthrough-openai-000 | TODO
[**postSessionTranslate000**](DefaultAPI.md#postsessiontranslate000) | **POST** /session/requests/translate-000 | TODO
[**postSessionWhisper000**](DefaultAPI.md#postsessionwhisper000) | **POST** /session/requests/whisper-000 | TODO
[**postSessions**](DefaultAPI.md#postsessions) | **POST** /sessions | TODO


# **postSessionAssist000**
```swift
    open class func postSessionAssist000(sessionID: String, modelsAssist000Input: ModelsAssist000Input? = nil, completion: @escaping (_ data: ModelsAssist000Output?, _ error: Error?) -> Void)
```

TODO

TODO

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import Bashi

let sessionID = "sessionID_example" // String | A session_id retrieved from POST /sessions
let modelsAssist000Input = models_assist-000_Input(requestContext: "TODO", request: "request_example") // ModelsAssist000Input | TODO (optional)

// TODO
DefaultAPI.postSessionAssist000(sessionID: sessionID, modelsAssist000Input: modelsAssist000Input) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **sessionID** | **String** | A session_id retrieved from POST /sessions | 
 **modelsAssist000Input** | [**ModelsAssist000Input**](ModelsAssist000Input.md) | TODO | [optional] 

### Return type

[**ModelsAssist000Output**](ModelsAssist000Output.md)

### Authorization

[account_number](../README.md#account_number)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **postSessionCode000**
```swift
    open class func postSessionCode000(sessionID: String, modelsCode000Input: ModelsCode000Input? = nil, completion: @escaping (_ data: ModelsCode000Output?, _ error: Error?) -> Void)
```

TODO

TODO

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import Bashi

let sessionID = "sessionID_example" // String | A session_id retrieved from POST /sessions
let modelsCode000Input = models_code-000_Input(targetLanguage: "targetLanguage_example", whatIsBeingGenerated: "whatIsBeingGenerated_example", request: "request_example") // ModelsCode000Input | TODO (optional)

// TODO
DefaultAPI.postSessionCode000(sessionID: sessionID, modelsCode000Input: modelsCode000Input) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **sessionID** | **String** | A session_id retrieved from POST /sessions | 
 **modelsCode000Input** | [**ModelsCode000Input**](ModelsCode000Input.md) | TODO | [optional] 

### Return type

[**ModelsCode000Output**](ModelsCode000Output.md)

### Authorization

[account_number](../README.md#account_number)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **postSessionNoop**
```swift
    open class func postSessionNoop(sessionID: String, body: AnyCodable? = nil, completion: @escaping (_ data: PostSessionsRequestAllOfModelConfigurationsInnerAnyOf?, _ error: Error?) -> Void)
```

TODO

TODO

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import Bashi

let sessionID = "sessionID_example" // String | A session_id retrieved from POST /sessions
let body = "TODO" // AnyCodable | TODO (optional)

// TODO
DefaultAPI.postSessionNoop(sessionID: sessionID, body: body) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **sessionID** | **String** | A session_id retrieved from POST /sessions | 
 **body** | **AnyCodable** | TODO | [optional] 

### Return type

[**PostSessionsRequestAllOfModelConfigurationsInnerAnyOf**](PostSessionsRequestAllOfModelConfigurationsInnerAnyOf.md)

### Authorization

[account_number](../README.md#account_number)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **postSessionPassthroughOpenai000**
```swift
    open class func postSessionPassthroughOpenai000(sessionID: String, modelsPassthroughOpenai000Input: ModelsPassthroughOpenai000Input? = nil, completion: @escaping (_ data: ModelsPassthroughOpenai000Output?, _ error: Error?) -> Void)
```

TODO

TODO

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import Bashi

let sessionID = "sessionID_example" // String | A session_id retrieved from POST /sessions
let modelsPassthroughOpenai000Input = models_passthrough-openai-000_Input(openAiModel: "openAiModel_example", request: "request_example") // ModelsPassthroughOpenai000Input | TODO (optional)

// TODO
DefaultAPI.postSessionPassthroughOpenai000(sessionID: sessionID, modelsPassthroughOpenai000Input: modelsPassthroughOpenai000Input) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **sessionID** | **String** | A session_id retrieved from POST /sessions | 
 **modelsPassthroughOpenai000Input** | [**ModelsPassthroughOpenai000Input**](ModelsPassthroughOpenai000Input.md) | TODO | [optional] 

### Return type

[**ModelsPassthroughOpenai000Output**](ModelsPassthroughOpenai000Output.md)

### Authorization

[account_number](../README.md#account_number)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **postSessionTranslate000**
```swift
    open class func postSessionTranslate000(sessionID: String, modelsTranslate000Input: ModelsTranslate000Input? = nil, completion: @escaping (_ data: ModelsTranslate000Output?, _ error: Error?) -> Void)
```

TODO

TODO

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import Bashi

let sessionID = "sessionID_example" // String | A session_id retrieved from POST /sessions
let modelsTranslate000Input = models_translate-000_Input(targetLanguage: "targetLanguage_example", request: "request_example") // ModelsTranslate000Input | TODO (optional)

// TODO
DefaultAPI.postSessionTranslate000(sessionID: sessionID, modelsTranslate000Input: modelsTranslate000Input) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **sessionID** | **String** | A session_id retrieved from POST /sessions | 
 **modelsTranslate000Input** | [**ModelsTranslate000Input**](ModelsTranslate000Input.md) | TODO | [optional] 

### Return type

[**ModelsTranslate000Output**](ModelsTranslate000Output.md)

### Authorization

[account_number](../README.md#account_number)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **postSessionWhisper000**
```swift
    open class func postSessionWhisper000(sessionID: String, body: URL? = nil, completion: @escaping (_ data: ModelsWhisper000Output?, _ error: Error?) -> Void)
```

TODO

TODO

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import Bashi

let sessionID = "sessionID_example" // String | A session_id retrieved from POST /sessions
let body = URL(string: "https://example.com")! // URL | audio data in a conatiner format supported by ffmpeg (optional)

// TODO
DefaultAPI.postSessionWhisper000(sessionID: sessionID, body: body) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **sessionID** | **String** | A session_id retrieved from POST /sessions | 
 **body** | **URL** | audio data in a conatiner format supported by ffmpeg | [optional] 

### Return type

[**ModelsWhisper000Output**](ModelsWhisper000Output.md)

### Authorization

[account_number](../README.md#account_number)

### HTTP request headers

 - **Content-Type**: audio/*
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **postSessions**
```swift
    open class func postSessions(postSessionsRequest: PostSessionsRequest? = nil, completion: @escaping (_ data: PostSessions200Response?, _ error: Error?) -> Void)
```

TODO

TODO

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import Bashi

let postSessionsRequest = post_sessions_request(modelConfigurations: [post_sessions_request_allOf_modelConfigurations_inner(model: "model_example", functions: "TODO")], configuration: SessionConfiguration(locale: "locale_example", maxResponseTokens: 123, bestOf: 123, disabledBuiltinFunctions: [SessionConfiguration_disabledBuiltinFunctions_inner()])) // PostSessionsRequest | TODO (optional)

// TODO
DefaultAPI.postSessions(postSessionsRequest: postSessionsRequest) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **postSessionsRequest** | [**PostSessionsRequest**](PostSessionsRequest.md) | TODO | [optional] 

### Return type

[**PostSessions200Response**](PostSessions200Response.md)

### Authorization

[account_number](../README.md#account_number)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

