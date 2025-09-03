#!/bin/bash

# exit setup
set -eo pipefail
# [-e] - immediately exit if any command has a non-zero exit status
# [-x] - all executed commands are printed to the terminal [not secure]
# [-o pipefail] - if any command in a pipeline fails, that return code will be used as the return code of the whole pipeline

if [ -z "${GH_REPO}" ] || [ -z "${BUILD_PR_NUMBER}" ] || [ -z "${ST_SERVER_ENDPOINT}" ] || [ -z "${ST_OAUTH_TOKEN}" ]; then
  echo "❌ environments [GH_REPO, BUILD_PR_NUMBER, ST_SERVER_ENDPOINT, ST_OAUTH_TOKEN] is empty, please fill it with values..."
  exit 1
fi

TRACKER_TICKET=$(echo "${BRANCH_NAME}" | { grep -oE "^[a-zA-Z]+-[0-9]+(-|$)" || true; } | sed 's|-$||' | head -n1)
# check pr body
if [ -z "${TRACKER_TICKET}" ]; then
  TRACKER_TICKET=$(echo "${PR_BODY}" | { grep -oE "/link [a-zA-Z]+-[0-9]+" || true; } | { grep -oE "[a-zA-Z]+-[0-9]+" || true; } | head -n1)
fi
if [ ! -z "${TRACKER_TICKET}" ]; then
  echo "  ticket: ${TRACKER_TICKET}"
  REL_TYPE='rel="relates"'
  RESULT=$(curl -q -s -X LINK -H "Authorization:OAuth ${ST_OAUTH_TOKEN}" -H "Link: <https://github.com/${GH_REPO}/pull/${BUILD_PR_NUMBER}>; ${REL_TYPE}" "${ST_SERVER_ENDPOINT}/v2/issues/${TRACKER_TICKET}")
  STATUS_CODE=$(echo "${RESULT}" | jq -r '.statusCode')
  if [ "${STATUS_CODE}" != "200" ] && [ "${STATUS_CODE}" != "null" ]; then
    echo "❌ error link tracker ticket"
    echo "${RESULT}" | jq -r '" - " + .errorMessages[]'
  else
    echo "✅ ticket link success..."
  fi
else
  echo "❎ ticket number not found at branch name and pr body..."
fi
