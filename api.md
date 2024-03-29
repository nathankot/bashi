## `POST /api/sessions`

Create a session with the given model configurations. A session is required in
order to make requests. For now requests do not share context however in the
future requests may share context within the same session.

### Headers

| Name                                     | Required? | Description               |
| ---------------------------------------- | --------- | ------------------------- |
| `Authorization: Bearer <account number>` | yes       | The Bashi account number. |

### Request body

The request body should be a JSON object with the following shape:

```json
{
  "configuration": {
    "locale": "en-US",
    "defaultMaxResponseTokens": 1000
  },
  "modelConfigurations": {
    "assist-000": {
      "functions": {
        "webSearch": {
          "description": "search the internet or the given string",
          "args": [{ "name": "search string", "type": "string" }]
        },
        "createCalendarEvent": {
          "description": "create a calendar event for some time relative to now",
          "args": [
            {
              "name": "relative time",
              "type": "string",
              "parse": ["naturalLanguageDateTime"]
            }
          ]
        }
      }
    }
  }
}
```

- `functions` - a list of functions supported by the client, that the model should
  be aware of.

### Response body

The response body is a JSON object with the following shape:

```json
{
  "session": {
    "sessionId": "123e4567-e89b-12d3-a456-426614174000",
    "expiresAt": "2023-05-05T00:00:00Z",
    "configuration": {
      "locale": "en-US"
    },
    "modelConfigurations": {
      "assist-000": {
        "functions": {
          "webSearch": {
            "description": "search the internet or the given string",
            "args": [{ "name": "search string", "type": "string" }]
          },
          "createCalendarEvent": {
            "description": "create a calendar event for some time relative to now",
            "args": [
              {
                "name": "relative time or absolute date and time",
                "type": "string",
                "parse": ["relativeTime"]
              }
            ]
          }
        }
      }
    }
  },
  "builtinFunctions": {
    "time": {
      "description": `check the time for the given timezone`,
      "args": [{ "name": "tz database timezone name", "type": "string" }]
    },
    "write": {
      "description": "write the result of the function in the line above into the current context",
      "args": []
    }
  }
}
```

---

## `POST /api/session/requests/{modelName}`

Make a request to a specific model.

### Url params

| Name        | Description                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------------- |
| `modelName` | The name of the model to use, this dictates the input format. For example, `assist-000`, `whisper-000`. |

### Headers

| Name                                 | Required? | Description                                        |
| ------------------------------------ | --------- | -------------------------------------------------- |
| `Authorization: Bearer <session id>` | yes       | The session ID retrieved from `POST /api/sessions` |

### Request/Response

Each model has it's own input/output schemas. They are listed below.

#### `assist-*`

##### Request body

The request body should be a JSON object with the following shape:

```json
{
  "request": "your request here",
  "requestContext": {}
}
```

##### Response body

```json
{
  "request": "whats the time in new york? and make a calendar event for dinner with wife 5 days from now",
  "functionCalls": [
    {
      "type": "parsed_and_executed",
      "name": "time",
      "args": ["America/New_York"],
      "returnValue": "12/17/2022, 10:05:53 AM"
    },
    {
      "type": "parsed_and_executed",
      "name": "write",
      "args": []
    },
    {
      "type": "parsed_and_executed",
      "name": "createCalendarEvent",
      "args": ["5 days from now", "dinner with wife"],
      "argsParsed": [{ "naturalLanguageDateTime": "2022-12-22T18:00:00Z" }, {}]
    }
  ]
}
```

##### Additional context

Some requests may require additional context to be provided to the endpoint. For
example, if the request is to refactor code, then the code to be refactored
needs to be provided as context.

If supported by the model and known beforehand, this context can be
pre-populated with the `requestContext` field, e.g:

```json
{
  "request": "some request",
  "requestContext": {
    "text": "function() {}"
  }
}
```

The `requestContext` key is an arbitrary value map of `string` keys to `string |
number | boolean`.

If the required context is not known beforehand, the endpoint will respond `400
Bad Request` and a JSON response detailing what context is required:

```json
{
  "missingRequestContext": {
    "text": { "type": "string" }
  }
}
```

You can fulfill this requirement by calling the endpoint again with:

```json
{
  "requestContext": {
    "text": "function() {}"
  }
}
```

#### `whisper-*`

##### Request body

The request body should be raw audio waveform data that ffmpeg can recognize. This is transcribed by the API.

##### Response body

A JSON object is returned with the following shape:

```json
{
  "transcribed": "the result of the transcription"
}
```
