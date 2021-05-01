#!/usr/bin/env bash

K_REVISION=local npx node -r ts-node/register -r dotenv/config ./src/cli.ts "$@"
