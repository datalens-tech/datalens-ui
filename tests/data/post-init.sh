#!/bin/bash

# exit setup
set -eo pipefail
# [-e] - immediately exit if any command has a non-zero exit status
# [-x] - all executed commands are printed to the terminal [not secure]
# [-o pipefail] - if any command in a pipeline fails, that return code will be used as the return code of the whole pipeline

if [ -z "${POSTGRES_USER_US}" ]; then POSTGRES_USER_US="${POSTGRES_USER}"; fi
if [ -z "${POSTGRES_USER_DEMO}" ]; then POSTGRES_USER_DEMO="${POSTGRES_USER}"; fi
if [ -z "${POSTGRES_PASSWORD_US}" ]; then POSTGRES_PASSWORD_US="${POSTGRES_PASSWORD}"; fi
if [ -z "${POSTGRES_PASSWORD_DEMO}" ]; then POSTGRES_PASSWORD_DEMO="${POSTGRES_PASSWORD}"; fi

if [ -z "${POSTGRES_HOST}" ]; then
  POSTGRES_HOST="postgres"
fi
export PGPORT="${POSTGRES_PORT}"

echo "  [post-init] start e2e data migration..."

# shellcheck disable=SC2236
if [ ! -z "${US_ENDPOINT}" ]; then
  echo "  [post-init] us endpoint: ${US_ENDPOINT}"

  echo "  [post-init] sleep 5 seconds..."
  sleep 5

  RETRIES="10"
  echo "  [post-init] retries: ${RETRIES}"

  for RETRY in $(seq 1 $RETRIES); do
    if curl --output /dev/null --silent --head --fail "${US_ENDPOINT}/ping-db"; then
      echo "  [post-init] us /ping-db success, continue..."
      break
    fi

    echo "  [post-init] sleep 3 second..."
    sleep 3
  done

  echo "  [post-init] retry: ${RETRY}"

  if [ "${RETRY}" == "${RETRIES}" ]; then
    echo "  [post-init] error [${US_ENDPOINT}/ping-db], exit..."
    exit 1
  fi
fi

export PGPASSWORD="${POSTGRES_PASSWORD_DEMO}"

echo "  [post-init] import e2e data..."
echo "  [post-init] postgres host: ${POSTGRES_HOST}"
echo "  [post-init] postgres port: ${POSTGRES_PORT}"

psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER_DEMO}" --dbname "${POSTGRES_DB_DEMO}" </init/post-init/sales-db.sql || exit 1

echo "  [post-init] import us demo entries..."

export PGPASSWORD="${POSTGRES_PASSWORD_US}"

FERNET_POSTGRES_PASSWORD=$(python /init/crypto.py "${CONTROL_API_CRYPTO_KEY}" "${POSTGRES_PASSWORD_DEMO}")

# shellcheck disable=SC2002
cat /init/post-init/us-e2e-data.sql |
  sed "s|{{POSTGRES_HOST}}|${POSTGRES_HOST}|" |
  sed "s|{{POSTGRES_PORT}}|${POSTGRES_PORT}|" |
  sed "s|{{POSTGRES_DB}}|${POSTGRES_DB_DEMO}|" |
  sed "s|{{POSTGRES_USER}}|${POSTGRES_USER_DEMO}|" |
  sed "s|{{POSTGRES_PASSWORD}}|${FERNET_POSTGRES_PASSWORD}|" |
  psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER_US}" --dbname "${POSTGRES_DB_US}" || exit 1

echo "  [post-init] finish e2e data migration..."
