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

if [ -z "${GH_REPO}" ] || [ -z "${ST_SERVER_ENDPOINT}" ] || [ -z "${ST_OAUTH_TOKEN}" ]; then
  echo "❌ environments [GH_REPO, ST_SERVER_ENDPOINT, ST_OAUTH_TOKEN] is empty, please fill it with values..."
  exit 1
fi

# shellcheck disable=SC2001
RELEASE_NUMBER=$(echo "${BRANCH_NAME}" | sed 's|release-||')

RELEASE_PR_NUMBER=$(
  curl -q -s -H "Authorization: Bearer ${GH_TOKEN}" \
    "https://api.github.com/repos/${GH_REPO}/releases/tags/v${RELEASE_NUMBER}" |
    jq -r '.body' | { grep -oE '\(#[0-9]+\)' || true; } | { grep -oE '[0-9]+' || true; }
)

if [ -z "${RELEASE_PR_NUMBER}" ]; then
  echo "❎ pr number not found at release [${RELEASE_NUMBER}]..."
  exit 0
fi

echo "  release: ${RELEASE_PR_NUMBER}"

PR_JSON_DATA="$(
  curl -q -s -H "Authorization: Bearer ${GH_TOKEN}" \
    "https://api.github.com/repos/${GH_REPO}/pulls/${RELEASE_PR_NUMBER}"
)"

PR_BRANCH_NAME=$(echo "${PR_JSON_DATA}" | tr -d '\r' | jq -r '.head.ref')

echo "  branch: ${PR_BRANCH_NAME}"

TRACKER_TICKET=$(echo "${PR_BRANCH_NAME}" | { grep -oE "^[a-zA-Z]+-[0-9]+(-|$)" || true; } | sed 's|-$||' | head -n1)

# check pr body
if [ -z "${TRACKER_TICKET}" ]; then
  PR_BODY=$(echo "${PR_JSON_DATA}" | tr -d '\r' | jq -r '.body')
  TRACKER_TICKET=$(echo "${PR_BODY}" | { grep -oE "/link [a-zA-Z]+-[0-9]+" || true; } | { grep -oE "[a-zA-Z]+-[0-9]+" || true; } | head -n1)
fi

if [ ! -z "${TRACKER_TICKET}" ]; then
  echo "  ticket: ${TRACKER_TICKET}"

  TICKET_STATUS=$(curl -q -s -H "Authorization:OAuth ${ST_OAUTH_TOKEN}" "${ST_SERVER_ENDPOINT}/v2/issues/${TRACKER_TICKET}" | jq -r '.status.key')

  echo "  ticket status: ${TICKET_STATUS}"

  if [ "${TICKET_STATUS}" = "inProgress" ] || [ "${TICKET_STATUS}" = "pullRequest" ]; then
    RESULT=$(curl -q -s -X POST -H "Authorization:OAuth ${ST_OAUTH_TOKEN}" "${ST_SERVER_ENDPOINT}/v2/issues/${TRACKER_TICKET}/transitions/merged/_execute")
    STATUS_CODE=$(echo "${RESULT}" | jq -r '.statusCode')

    if [ "${STATUS_CODE}" != "200" ] && [ "${STATUS_CODE}" != "null" ]; then
      echo "❌ error change status tracker ticket"
      echo "${RESULT}" | jq -r '" - " + .errorMessages[]'
    else
      echo "✅ ticket change status to [merged] success..."
    fi
  fi

  HASH_SYMBOL='#'
  TICKET_COMMENT_ID=$(curl -q -s \
    -H "Authorization:OAuth ${ST_OAUTH_TOKEN}" \
    "${ST_SERVER_ENDPOINT}/v2/issues/${TRACKER_TICKET}/comments?perPage=100" | jq -c 'map({"id":.id,"text":.text}) | .[]' | { grep -F "/merged [${HASH_SYMBOL}${RELEASE_PR_NUMBER}]" || true; } | jq -r '.id' 2>/dev/null)

  if [ ! -z "${TICKET_COMMENT_ID}" ]; then
    echo "❎ ticket merged comment already exists..."
    exit 0
  fi

  COMMENT_BODY="/merged [#${RELEASE_PR_NUMBER}](https://github.com/${GH_REPO}/pull/${RELEASE_PR_NUMBER})\n\n${COMMENT_MESSAGE}: [v${RELEASE_NUMBER}](https://github.com/${GH_REPO}/releases/tag/v${RELEASE_NUMBER})"

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
