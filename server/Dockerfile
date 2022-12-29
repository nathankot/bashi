FROM denoland/deno:alpine-1.29.1

ARG GIT_REVISION
ENV DENO_DEPLOYMENT_ID=${GIT_REVISION}

WORKDIR /app

COPY . .
EXPOSE 8080

CMD ["deno", "run", "-c", "./deno.vendored.json", "-A", "--no-remote", "--cached-only", "main.ts"]
