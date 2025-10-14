#!/bin/bash

# exit setup
set -eo pipefail
# [-e] - immediately exit if any command has a non-zero exit status
# [-x] - all executed commands are printed to the terminal [not secure]
# [-o pipefail] - if any command in a pipeline fails, that return code will be used as the return code of the whole pipeline

SCRIPT_DIR=$(dirname -- "$(readlink -f -- "$0")")

# ubuntu 22.04 - nodejs 20
# ubuntu 24.04 - nodejs 22
UBUNTU_VERSION="24.04"

# version from main package.json
NPM_PACKAGES_LIST=$(npm list --depth=0 2>/dev/null || true)
PLAYWRIGHT_VERSION=$(echo "${NPM_PACKAGES_LIST}" | { grep '@playwright/test' || true; } | sed -E 's|.+@\^?||')

IMAGE_NAME="ghcr.io/datalens-tech/datalens-playwright"
IMAGE_TAG="${PLAYWRIGHT_VERSION}-${UBUNTU_VERSION}"

IS_CLEAR="false"

# parse args
for _ in "$@"; do
  case ${1} in
  --clear)
    IS_CLEAR="true"
    shift # past argument with no value
    ;;
  -*)
    echo "unknown arg: ${1}"
    exit 1
    ;;
  *) ;;
  esac
done

echo "🧪 Playwright tests in docker..."
echo ""

echo "  playwright: ${PLAYWRIGHT_VERSION}"
echo "  ubuntu: ${UBUNTU_VERSION}"
echo ""

if [ "${IS_CLEAR}" = "true" ]; then
  docker volume rm datalens-playwright &>/dev/null || true
  docker volume rm datalens-playwright-npm &>/dev/null || true
  exit 0
fi

if docker volume ls -f name=datalens-playwright | { grep -q -s "datalens-playwright" || false; }; then
  echo "  volume [datalens-playwright] already exists"
else
  docker volume create datalens-playwright &>/dev/null
fi

if docker volume ls -f name=datalens-playwright-npm | { grep -q -s "datalens-playwright-npm" || false; }; then
  echo "  volume [datalens-playwright-npm] already exists"
else
  docker volume create datalens-playwright-npm &>/dev/null
fi

echo ""
echo "👟 Run tests..."
echo ""

docker run -it \
  -v "datalens-playwright-npm:/home/github/.cache/npm-cache/" \
  -v "datalens-playwright:/home/github/app/node_modules/" \
  -v "${SCRIPT_DIR}/../../:/home/github/app/" \
  --name "datalens-playwright" \
  --network host \
  --env HOME=/home/github \
  --rm --tty \
  --workdir "/home/github/app" \
  --entrypoint "/bin/bash" \
  "${IMAGE_NAME}:${IMAGE_TAG}" \
  -c "npm run deps && ${1}"
