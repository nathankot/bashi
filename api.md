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
  "modelConfigurations": {
    "assist-davinci-003": {
      "functions": [
        {
          "name": "insertText",
          "description": "insert text under the current caret location",
          "args": [{ "name": "text", "type": "string" }]
        },
        {
          "name": "webSearch",
          "description": "search the internet or the given string",
          "args": [{ "name": "search string", "type": "string" }]
        }
      ]
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
  "sessionId": "123e4567-e89b-12d3-a456-426614174000",
  "expiresAt": "2023-05-05T00:00:00Z",
  "modelConfigurations": {
    "assist-davinci-003": {
      "functions": [
        {
          "name": "insertText",
          "description": "insert text under the current caret location",
          "args": [{ "name": "text", "type": "string" }]
        },
        {
          "name": "webSearch",
          "description": "search the internet or the given string",
          "args": [{ "name": "search string", "type": "string" }]
        }
      ]
    }
  }
}
```

---

## `POST /api/session/transcriptions`

### Headers

| Name                                 | Required? | Description                                        |
| ------------------------------------ | --------- | -------------------------------------------------- |
| `Authorization: Bearer <session id>` | yes       | The session ID retrieved from `POST /api/sessions` |

### Request body

The request body should be raw audio waveform data that ffmpeg can recognize. This is transcribed by the API.

### Response body

A JSON object is returned with the following shape:

```json
{
  "text": "the result of the transcription"
}
```

---

## `POST /api/session/requests`

Typically called after transcribing audio data into textual representation of
the request.

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
  "model": "assist-davinci-003",
  "request": "your request here"
}
```

##### Response body

```json
{
  "model": "assist-davinci-003",
  "request": "your request here",
  "text": "",
  "commands": [
    {
      "name": "insertText",
      "args": ["some text to insert"]
    }
  ]
}
```
