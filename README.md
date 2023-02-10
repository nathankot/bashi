# 🌁 Bashi

Bashi is an extensible, ready-to-use platform that bridges LLMs to tasks and
actions.

It comes with an OSX personal assistant app, so you can try it out
quickly, and mould the app to your own needs.

This repo has two components:

- The Bashi API server.
- The OSX app 'assist', which serves as an example client implementation, as
  well as a usable product (albeit it needs some more work!)

Examples of the assist OSX app in action:

<p float="left">
  <img src="images/example_1.png?raw=true" width="200" />
  <img src="images/example_2.png?raw=true" width="200" />
</p>

## LLM+REPL

Bashi uses a novel approach in that the LLM is asked to write Javascript and the
server effectively provides a REPL for the model. Below are some example
prompt+completions. All of these are real examples that you can try on the OSX
app :+1:

```markdown
Request: help me write a commit message please
Thought: I need to generate a commit message based on a diff
Action: returnText(writeCommitMessage(getInputText(\"diff\")));
```

```markdown
Request: there is a function I don't understand, can help me summarize it?
Thought: I need to extract the information from the given string
Action: returnText(extractInformation(\"summarize the function\", getInputText(\"what is the function?\")))
```

There seems to be some advantages to this:

- Reduced completion sizes since not only does code compact information, but by
  having multiple steps in a single action you save on model round trips.
- GPT3.5 was probably trained on lots of Javascript, so asking it to write Javascript
  may lead to tendencies towards emergent reasoning/logic characteristics.

## Extensible

### Client-defined commands

Clients are able to _extend_ the capabilties of the agent by providing their own
commands/functions. For example the OSX client provides the server with
information about the `createCalendarEvent` command:

```swift
AnonymousCommand(
    name: "createCalendarEvent",
    cost: .Low,
    description: "make calendar event for the given name, datetime and duration",
    args: [
            .init(type: .string, name: "name"),
            .init(type: .string, name: "iso8601Date"),
            .init(type: .number, name: "event duration in hours")
    ],
    returnType: .void,
    triggerTokens: ["calendar", "event", "appointment", "meeting"],
    runFn: { (api, ctx, args) async throws -> BashiValue in
        // ... redacted guard code
        let event = EKEvent.init(eventStore: self.eventStore)
        event.startDate = date
        event.title = name
        event.endDate = date.addingTimeInterval(60 * 60 * hours.doubleValue)
        event.calendar = defaultCalendar
        try self.eventStore.save(event, span: .thisEvent, commit: true)
        await api.indicateCommandResult(message: "Calendar event created")
        return .init(.void)
    }),
```

Commands can be resolved on either the client or the server. The example above
is a command resolved on the client. In contrast, there are commands like `math`
that are resolved on the server.

### Write your own client

Clients just need to interface with the API defined in
[`openapi.json`](server/static/openapi.json). There are plenty of OpenAPI
definition -> client library generation tools out there to help get things
started if you wish to write a client in a new language.

## Running it locally

### Server

After cloning the repo, set up your API keys. At minimum you'll need an OpenAI
API key.

```sh
cp server/.env.template server/.env
# edit server/.env
```

Run the entire server stack using docker:

```sh
make build
make up-all
open http://localhost:8003
```

The index page has some examples and you can play around with text or audio
prompts. Although any commands that must be resolved on the client-side are
fixtures/dummies. (The OSX app includes 'real' client-side commands).

If you are working on the server, you should set up the live-reloading
server. Not only does this pick up code changes, but it also generates the
OpenAPI spec when there are changes to API interface.

```sh
make dev
open http://localhost:8080
```

### OSX App

Currently pre-built binaries are not available so you'll need to build the OSX app yourself.

Open the `xcworkspace` in Xcode:

```
open assist/assist.xcworkspace
```

You'll want to build the 'assist' scheme. **Note** by default the app points to
`http://localhost:8003/api` which corresponds to the server running in docker
via `make up-all`. If you are running the server with `make dev` you'll want to
update the API base URL to `http://localhost:8080/api`by going to the app
settings.

Any changes to the API surface will require a new swift client to be generated
using `make clients`.

## Documentation

I still need to work on some more comprehensive documentation for the codebase 🙇

### API Spec

The API is described in [openapi.json](server/static/openapi.json) which can be
plugged into https://editor.swagger.io/ for viewing.

## Contributing

Let's build JARVIS together :)

There is no contribution guide for now, but you are welcome to make
contributions to the OSX client (or introduce new clients if you are okay with
an unstable API).

Issues and feature requests are accepted for the `server/`, but not code changes
at this moment.

### Testing

For the OSX client run tests via Xcode as per usual.
For the server use `make test` to run tests, and `make test-update` to update
test snapshots. [Snapshot
testing](https://deno.land/manual@v1.28.3/basics/testing/snapshot_testing) is
used liberally, for better or for worse 🙈
