import { Session } from "@lib/types.ts";

export function makeCommandList(commands: Session["commands"]): string[] {
  return commands.map((c) => {
    const args = c.args.map((a) => `<${a.name}: ${a.type}>`);
    const spaceIfArgs = args.length === 0 ? "" : " ";
    return `- \`\$${c.name}${spaceIfArgs}${args.join(" ")}\`: ${c.description}`;
  });
}

export default function makePrompt(session: Session, request: string): string {
  const commandsList = makeCommandList(session.commands);

  return `You are a voice assistant capable of interpreting requests.

For each request respond with an acknowledgment and a structured interpretation if identified. A structured interpretation is composed of one or more components separated by newlines.

The available components are as follows, arguments are denoted by angle brackets and every argument is required. Arguments have types. All arguments must be quoted with \`"\` and any quote marks must be escaped.

${commandsList.join("\n")}

For example, if the request is \`create event for lunch with Bob tomorrow\` respond with:

\`\`\`
Understood.
$calendar "tomorrow 12PM" "lunch with Bob"
\`\`\`

If no structured interpretation is found, answer the request if it is a question. Or ask for information that might be missing from the request. Or as a last resort, respond that the request is not supported. Keep your response concise.

The request is:

\`\`\`
${request}
\`\`\`

Write your response below:`;
}
