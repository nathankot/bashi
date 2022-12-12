## `POST /api/session`

Create a session with the given configuration. A session is required in order to
make requests. For now requests do not share context however in the future
requests may share context within the same session.

### Headers

| Name                                     | Required? | Description               |
| ---------------------------------------- | --------- | ------------------------- |
| `Authorization: Bearer <account number>` | yes       | The Bashi account number. |

### Request body

The request body should be a JSON object with the following shape:

```json
{
  "commands": [
    {
      "name": "insert-text",
      "description": "insert text under the current caret location",
      "args": [{ "name": "text", "type": "string" }]
    },
    {
      "name": "web-search",
      "description": "search the internet or the given string",
      "args": [{ "name": "search string", "type": "string" }]
    }
  ]
}
```

- `commands` - a list of commands supported by the client, that the model should
  be aware of.

### Response body

The response body is a JSON object with the following shape:

```json
{
  "sessionId": "123e4567-e89b-12d3-a456-426614174000",
  "expiresAt": "2023-05-05T00:00:00Z"
}
```

---

## `POST /api/transcribe`

### Headers

| Name                                 | Required? | Description                                       |
| ------------------------------------ | --------- | ------------------------------------------------- |
| `Authorization: Bearer <session id>` | yes       | The session ID retrieved from `POST /api/session` |

### Request body

The request body should be raw audio waveform data. This is transcribed by the API.

### Response body

A JSON object is returned with the following shape:

```json
{
  "text": "the result of the transcription"
}
```

---

## `POST /api/request`

Typically called after transcribing audio data into textual representation of
the request.

### Headers

| Name                                 | Required? | Description                                       |
| ------------------------------------ | --------- | ------------------------------------------------- |
| `Authorization: Bearer <session id>` | yes       | The session ID retrieved from `POST /api/session` |

### Request body

The request body should be a JSON object with the following shape:

```json
{ "request": "your request here" }
```

### Response body

```json
{
  "text": "",
  "commands": [
    {
      "name": "insert-text",
      "args": ["some text to insert"]
    }
  ]
}
```
