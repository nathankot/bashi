FROM denoland/deno:alpine-1.29.1

ARG GIT_REVISION
ENV DENO_DEPLOYMENT_ID=${GIT_REVISION}

WORKDIR /app

COPY . .
COPY deno.vendored.json deno.json
EXPOSE 8080

CMD ["deno", "run", "--no-remote", "--cached-only", "--allow-read", "--allow-write", "--allow-run", "--allow-env", "--allow-net", "main.ts"]
