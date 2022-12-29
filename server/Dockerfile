FROM denoland/deno:alpine-1.29.1

ARG GIT_REVISION
ENV DENO_DEPLOYMENT_ID=${GIT_REVISION}

WORKDIR /app

COPY . .
RUN deno check main.ts

EXPOSE 8080

CMD ["run", "--no-remote", "-A", "--lock", "deno.lock", "--cached-only", "main.ts"]
