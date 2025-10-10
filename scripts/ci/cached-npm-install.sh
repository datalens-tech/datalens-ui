#!/bin/bash

echo "📦 [cache] npm ci run"

PROJECT_DIR="${PWD}"
NPM_CACHE_ROOT=${NPM_CACHE_ROOT:-${HOME}/.cache/npm-cache}
NODE_ENV=${NODE_ENV:-development}
NODE_VERSION=$(node --version)

echo ""
echo "========================"
echo "  project directory: ${PROJECT_DIR}"
echo "  npm cache root: ${NPM_CACHE_ROOT}"
echo "  node version: ${NODE_VERSION}"
echo "  node env: ${NODE_ENV}"
echo "========================"
echo ""

PACKAGE_FILE="${PWD}/package.json"
PACKAGE_LOCK_FILE="${PWD}/package-lock.json"

echo "  package-lock file: ${PACKAGE_LOCK_FILE}"

PACKAGES_HASH=$(sha1sum "${PACKAGE_LOCK_FILE}" | cut -d ' ' -f1)
echo "  hash: ${PACKAGES_HASH}"
echo ""

PACKAGES_CACHE_DIR="${NPM_CACHE_ROOT}/${NODE_VERSION}-${NODE_ENV}/${PACKAGES_HASH}"

if [ -d "${PACKAGES_CACHE_DIR}" ] && [ -f "${PACKAGES_CACHE_DIR}/package-lock.json" ]; then
  if ! cmp --silent "${PACKAGE_FILE}" "${PACKAGES_CACHE_DIR}/package.json"; then
    echo "⚠️  WARNING ⚠️  package.json changed:"
    echo ""
    diff --color "${PACKAGES_CACHE_DIR}/package.json" package.json
    echo ""
    echo "- if changes could affect [package-lock.json], run: rm -rf node_modules && npm install --package-lock-only && npm run deps"
    echo ""
    echo "- or copy package.json to cached dir to ignore difference: cp package.json ${PACKAGES_CACHE_DIR}/package.json"
    echo ""
  fi

  echo "🎯 cache found: ${PACKAGES_CACHE_DIR}"
  echo ""

  shopt -s dotglob
  rm -rf node_modules/* && cp -R "${PACKAGES_CACHE_DIR}/node_modules/." node_modules/
  shopt -u dotglob

  echo "  ✅ cache loaded..."
else
  echo "⚠️ cache not found: ${PACKAGES_CACHE_DIR}"

  echo ""
  echo "  installing..."
  echo ""

  npm ci --legacy-peer-deps=false --production=false --cache "${NPM_CACHE_ROOT}" --prefer-offline --no-audit
  NPM_CI_EXIT_CODE="$?"

  echo ""

  if [ "${NPM_CI_EXIT_CODE}" == "0" ]; then
    if [ ! -d "${PACKAGES_CACHE_DIR}" ]; then
      mkdir -p "${PACKAGES_CACHE_DIR}"

      cp -R node_modules "${PACKAGES_CACHE_DIR}/node_modules"
      cp package.json "${PACKAGES_CACHE_DIR}/package.json"
      cp package-lock.json "${PACKAGES_CACHE_DIR}/package-lock.json"

      echo "✅ cache created: ${PACKAGES_CACHE_DIR}"
      echo ""
    else
      echo "⚠️ cache directory already exists..."
      echo ""
    fi
  else
    echo "❌ failed to run 'npm ci'"
    echo ""
    exit 1
  fi
fi
