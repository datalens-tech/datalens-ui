#!/bin/bash
set -e

ts-node --transpile-only scripts/ci/lint-typecheck/helpers/check-features.ts
