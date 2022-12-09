FROM denoland/deno:alpine-1.28.3

ARG GIT_REVISION
ENV DENO_DEPLOYMENT_ID=${GIT_REVISION}

WORKDIR /app

COPY import_map.json deno.json deps.ts .
RUN deno cache deps.ts

COPY . .
RUN deno cache main.ts
RUN deno check main.ts

EXPOSE 8080

CMD ["run", "-A", "main.ts"]
