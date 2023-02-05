FROM denoland/deno:alpine-1.29.1

ARG GIT_REVISION
ENV DENO_DEPLOYMENT_ID=${GIT_REVISION}

WORKDIR /app

EXPOSE 8080
RUN deno --version
COPY import_map.json deno.json deno.lock cache_imports.ts .
RUN deno cache cache_imports.ts
COPY . .
RUN deno cache --check main.ts

CMD ["deno", "run", "--cached-only", "--allow-read", "--allow-write", "--allow-run", "--allow-env", "--allow-net", "main.ts"]
