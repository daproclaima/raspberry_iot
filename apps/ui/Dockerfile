FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat python3 py3-pip make g++

EXPOSE 3000

ENV NEXT_TELEMETRY_DISABLED 1

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

COPY . ./

VOLUME /app/node_modules


# "development" stage
# depends on the "deps" stage above
FROM deps AS dev
EXPOSE 9230
CMD ["npm", "run", "dev"]



# "build" stage
# depends on the "deps" stage above
FROM deps AS build

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=deps /app ./app

RUN set -eux;

CMD ["npm", "run", "prepare"]
CMD ["npm", "run", "build"]

# "production" stage
# depends on the "deps" stage above
FROM build AS prod

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

RUN #addgroup --system --gid 1001 nodejs
RUN #adduser --system --uid 1001 nextjs

COPY --from=deps /app/node_modules ./node_modules
#COPY --from=build /app/.next ./.next

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# https://nextjs.org/docs/advanced-features/output-file-tracing

USER nextjs

RUN set -eux;

CMD ["npm", "run", "start"]
