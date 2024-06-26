#https://kariera.future-processing.pl/blog/dockerfile-good-practices-for-node-and-npm/

# docker run --network host --env MQTT_BROKER_URL='mqtt://user:pass@raspberrypi:1883' -v /sys:/sys -v /dev:/dev raspberry_iot-server:latest

FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat python3 py3-pip make g++

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
EXPOSE 9229
CMD ["npm", "run", "dev"]


# "production" stage
# depends on the "deps" stage above
FROM deps AS prod

ENV NODE_ENV production
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 server

COPY --from=deps /app/node_modules ./node_modules

# Set the correct permission for prerender cache

RUN chown server:nodejs .

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing

USER server

RUN set -eux

CMD ["npm", "run", "start"]

# #https://kariera.future-processing.pl/blog/dockerfile-good-practices-for-node-and-npm/
  #
  ## docker run --network host --env MQTT_BROKER_URL='mqtt://user:pass@raspberrypi:1883' -v /sys:/sys -v /dev:/dev raspberry_iot-server:latest
  #
  #FROM node:22-alpine AS base
  #ARG PUID=1001
  #ARG PGID=1001
  #
  #
  ## Install dependencies only when needed
  #FROM base AS deps
  ## Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
  #RUN set -xe \
  #    && apk add --no-cache -Uu --virtual .build-dependencies make g++ libc6-compat python3-dev libffi-dev openssl-dev build-base musl \
  #    && pip3 install --no-cache --upgrade pyserial RPi.GPIO \
  #    && apk del --purge .build-dependencies \
  #    && apk add --no-cache --purge curl ca-certificates musl wiringpi \
  #    && rm -rf /var/cache/apk/* /tmp/*
  #WORKDIR /app
  #
  ## Install dependencies based on the preferred package manager
  #COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
  #RUN \
  #  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  #  elif [ -f package-lock.json ]; then npm ci; \
  #  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  #  else echo "Lockfile not found." && exit 1; \
  #  fi
  #
  #COPY . ./
  #
  #VOLUME /app/node_modules
  #
  #
  ## "development" stage
  ## depends on the "deps" stage above
  #FROM deps AS dev
  #
  #COPY --from=deps /usr/lib /usr/lib
  #COPY --from=deps /app/node_modules ./node_modules
  #
  #EXPOSE 9229
  #CMD ["npm", "run", "dev"]
  #
  #
  ## "production" stage
  ## depends on the "deps" stage above
  #FROM deps AS prod
  #
  #ENV NODE_ENV production
  ## set hostname to localhost
  #ENV HOSTNAME "0.0.0.0"
  #
  #RUN addgroup --system --gid 1001 nodejs
  #RUN adduser --system --uid 1001 server
  #
  #COPY --from=deps /app/node_modules ./node_modules
  #
  ## Set the correct permission for prerender cache
  #
  #RUN chown server:nodejs .
  #
  ## Automatically leverage output traces to reduce image size
  ## https://nextjs.org/docs/advanced-features/output-file-tracing
  #
  #USER server
  #
  #RUN set -eux
  #
  #CMD ["npm", "run", "start"]
