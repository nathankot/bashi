import { Session } from "@lib/session.ts";
import { Output } from "@lib/models.ts";

export type OutputInterceptor = (
  session: Session,
  output: Output
) => Promise<Output>;
