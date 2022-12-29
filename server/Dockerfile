FROM denoland/deno:alpine-1.29.1

ARG GIT_REVISION
ENV DENO_DEPLOYMENT_ID=${GIT_REVISION}

WORKDIR /app

COPY deno.lock .

# NPM modules are consistently having network troubles
# for me, so cache them individually:
RUN deno cache "npm:openai@^3.1.0"
RUN deno cache "npm:typescript-parsec@0.1.0"
RUN deno cache "npm:cockatiel@3.0.0"
RUN deno cache "npm:chrono-node@2.4.2"

COPY import_map.json deno.json deno.lock deps.ts .
RUN deno cache --lock deno.lock deps.ts

COPY . .
RUN deno cache --lock deno.lock main.ts
RUN deno check main.ts

EXPOSE 8080

CMD ["run", "-A", "--lock", "deno.lock", "--cached-only", "main.ts"]
