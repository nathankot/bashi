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
    "assist-davinci-003": {
      "functions": {
        "insertText": {
          "description": "insert text under the current caret location",
          "args": [{ "name": "text", "type": "string" }]
        },
        "webSearch": {
          "description": "search the internet or the given string",
          "args": [{ "name": "search string", "type": "string" }]
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
      "assist-davinci-003": {
        "functions": {
          "insertText": {
            "description": "insert text under the current caret location",
            "args": [{ "name": "text", "type": "string" }]
          },
          "webSearch": {
            "description": "search the internet or the given string",
            "args": [{ "name": "search string", "type": "string" }]
          }
        }
      }
    }
  },
  "knownFunctions": {
    "time": {
      "description": `check the time for the given timezone`,
      "args": [{ "name": "tz database timezone name", "type": "string" }]
    }
  }
}
```

---

## `POST /api/session/requests/{modelName}`

Typically called after transcribing audio data into textual representation of
the request.

### Url params

| Name        | Description                                                                                                 |
| ----------- | ----------------------------------------------------------------------------------------------------------- |
| `modelName` | The name of the model to use, this dictates the input format. For example, `assist-davinci-003`, `whisper`. |

### Headers

| Name                                 | Required? | Description                                        |
| ------------------------------------ | --------- | -------------------------------------------------- |
| `Authorization: Bearer <session id>` | yes       | The session ID retrieved from `POST /api/sessions` |

### Input/output options

Each model has it's own input/output schemas. They are listed below.

#### `assist-davinci-003`

##### Request body

The request body should be a JSON object with the following shape:

```json
{
  "request": "your request here"
}
```

##### Response body

```json
{
  "request": "your request here",
  "functionCalls": [
    {
      "type": "parsed",
      "name": "insertText",
      "args": ["some text to insert"]
    },
    {
      "type": "parsed_and_executed",
      "name": "time",
      "args": ["America/New_York"],
      "returnValue": "12/17/2022, 10:05:53 AM"
    }
  ]
}
```

#### `whisper`

##### Request body

The request body should be raw audio waveform data that ffmpeg can recognize. This is transcribed by the API.

##### Response body

A JSON object is returned with the following shape:

```json
{
  "transcribed": "the result of the transcription"
}
```
