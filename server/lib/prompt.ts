import { Session } from "@lib/types.ts";

export function makeCommandList(commands: Session["commands"]): string[] {
  return commands.map((c) => {
    const args = c.args.map((a) => `${a.name}: ${a.type}`);
    return `\`${c.name}(${args.join(", ")})\` - ${c.description}`;
  });
}

export default function makePrompt(session: Session, request: string): string {
  const commandsList = makeCommandList(session.commands);

  return `You are a voice assistant capable of interpreting requests.

For each request respond with an acknowledgment and a structured interpretation if identified. A structured interpretation is composed of one or more lines of function calls separated by newlines identifying what would need to happen in order to fulfill the request. You may only use function calls that are made available below.

The available functions are as follows, denoted in typescript function notation. When responding make sure that any quotes inside function string arguments are escaped.

${commandsList.join("\n")}

For example, if the request is \`create event for lunch with Bob tomorrow\` respond with:

\`\`\`
Understood.
calendar("tomorrow 12PM", "lunch with Bob")
\`\`\`

If no structured interpretation is found, answer the request if it is a question. Or ask for information that might be missing from the request. Or as a last resort, respond that the request is not supported.

The request is:

\`\`\`
${request}
\`\`\`

Write your response below:`;
}
