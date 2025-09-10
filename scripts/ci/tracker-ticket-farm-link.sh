#!/bin/bash

# exit setup
set -eo pipefail
# [-e] - immediately exit if any command has a non-zero exit status
# [-x] - all executed commands are printed to the terminal [not secure]
# [-o pipefail] - if any command in a pipeline fails, that return code will be used as the return code of the whole pipeline

if [ -z "${GH_TOKEN}" ]; then
  echo "🔑 env variable GH_TOKEN is empty, try to set from [gh] cli..."
  # shellcheck disable=SC2155
  export GH_TOKEN=$(gh auth token)
fi

if [ -z "${GH_REPO}" ] || [ -z "${BUILD_PR_NUMBER}" ] || [ -z "${FARM_ENDPOINT}" ] || [ -z "${ST_SERVER_ENDPOINT}" ] || [ -z "${ST_OAUTH_TOKEN}" ]; then
  echo "❌ environments [GH_REPO, BUILD_PR_NUMBER, FARM_ENDPOINT, ST_SERVER_ENDPOINT, ST_OAUTH_TOKEN] is empty, please fill it with values..."
  exit 1
fi

TRACKER_TICKET=$(echo "${BRANCH_NAME}" | { grep -oE "^[a-zA-Z]+-[0-9]+(-|$)" || true; } | sed 's|-$||' | head -n1)

# check pr body
if [ -z "${TRACKER_TICKET}" ]; then
  TRACKER_TICKET=$(echo "${PR_BODY}" | { grep -oE "/link [a-zA-Z]+-[0-9]+" || true; } | { grep -oE "[a-zA-Z]+-[0-9]+" || true; } | head -n1)
fi

if [ ! -z "${TRACKER_TICKET}" ]; then
  echo "  ticket: ${TRACKER_TICKET}"

  BRANCH_NAME_LOWER=$(echo "${BRANCH_NAME}" | tr '[:upper:]' '[:lower:]')

  # shellcheck disable=SC2001
  FARM_URL=$(echo "${FARM_ENDPOINT}" | sed "s|https://|https://${BRANCH_NAME_LOWER}.|")

  HASH_SYMBOL='#'
  TICKET_COMMENT_ID=$(curl -q -s \
    -H "Authorization:OAuth ${ST_OAUTH_TOKEN}" \
    "${ST_SERVER_ENDPOINT}/v2/issues/${TRACKER_TICKET}/comments?perPage=100" | jq -c 'map({"id":.id,"text":.text}) | .[]' | { grep -F "/farm [PR ${HASH_SYMBOL}${BUILD_PR_NUMBER}]" || true; } | jq -r '.id' 2>/dev/null)

  if [ ! -z "${TICKET_COMMENT_ID}" ]; then
    echo "❎ ticket farm link comment already exists..."
    exit 0
  fi

  COMMENT_BODY="/farm [PR ${HASH_SYMBOL}${BUILD_PR_NUMBER}](https://github.com/${GH_REPO}/pull/${BUILD_PR_NUMBER})\n\n${COMMENT_PREFIX}\n\n${COMMENT_MESSAGE}: [${BRANCH_NAME_LOWER}](${FARM_URL})"

  RESULT=$(curl -q -s -X POST -H "Authorization:OAuth ${ST_OAUTH_TOKEN}" -H "content-type: application/json" \
    --data "{\"text\":\"${COMMENT_BODY}\"}" \
    "${ST_SERVER_ENDPOINT}/v2/issues/${TRACKER_TICKET}/comments")
  STATUS_CODE=$(echo "${RESULT}" | jq -r '.statusCode')

  if [ "${STATUS_CODE}" != "200" ] && [ "${STATUS_CODE}" != "null" ]; then
    echo "❌ error add merged ticket comment"
    echo "${RESULT}" | jq -r '" - " + .errorMessages[]'
  else
    echo "✅ ticket merged comment added..."
  fi
else
  echo "❎ ticket number not found at branch name and pr body..."
fi
