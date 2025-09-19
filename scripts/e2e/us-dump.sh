#!/bin/bash

# exit setup
set -eo pipefail
# [-e] - immediately exit if any command has a non-zero exit status
# [-x] - all executed commands are printed to the terminal [not secure]
# [-o pipefail] - if any command in a pipeline fails, that return code will be used as the return code of the whole pipeline

SCRIPT_DIR=$(dirname -- "$(readlink -f -- "$0")")

IS_CLEAR_DELETED="false"
IS_CLEAR_E2E="false"

# parse args
for _ in "$@"; do
    case ${1} in
    --clear-deleted)
        IS_CLEAR_DELETED="true"
        shift # past argument with no value
        ;;
    --clear-e2e)
        IS_CLEAR_E2E="true"
        shift # past argument with no value
        ;;
    -*)
        echo "unknown arg: ${1}"
        exit 1
        ;;
    *) ;;
    esac
done

echo ""
echo "Start dump UnitedStorage entries..."
echo "  - workbooks"
echo "  - collections"
echo "  - entries"
echo "  - revisions"
echo "  - links"

if [ "${IS_CLEAR_DELETED}" = "true" ]; then
    echo "+ clear deleted entries automatically..."
fi
if [ "${IS_CLEAR_E2E}" = "true" ]; then
    echo "+ clear e2e entries automatically..."
fi

COMPOSE_FILE=$(readlink -f "${SCRIPT_DIR}/../../tests/docker-compose.e2e.yml")
DUMP_FILE=$(readlink -f "${SCRIPT_DIR}/../../tests/data/us-e2e-data.sql")

echo "BEGIN;" >"${DUMP_FILE}"

docker --log-level error compose -f "${COMPOSE_FILE}" exec \
    --env "POSTGRES_DUMP_CLEAR_META=true" \
    --env "POSTGRES_DUMP_SKIP_CONFLICT=false" \
    -T postgres \
    /init/us-dump.sh |
    sed -E 's|"cypher_text": "[^"]+"|"cypher_text": "{{POSTGRES_PASSWORD}}"|' |
    sed -E 's|"host": "[^"]+"|"host": "{{POSTGRES_HOST}}"|' |
    sed -E 's|"port": [^,]+,|"port": {{POSTGRES_PORT}},|' |
    sed -E 's|"db_name": "[^"]+"|"db_name": "{{POSTGRES_DB}}"|' |
    sed -E 's|"username": "[^"]+"|"username": "{{POSTGRES_USER}}"|' \
        >>"${DUMP_FILE}"

if [ "${IS_CLEAR_DELETED}" = "true" ]; then
    DUMP=$(cat "${DUMP_FILE}")
    DELETED_ENTRIES=$(
        echo "${DUMP}" |
            grep '__trash/' |
            grep 'public.entries' |
            grep -oE '__trash/[0-9]+_' |
            sed 's|__trash/||' |
            sed 's|_||' |
            tr -d ' ' |
            sort |
            uniq
    )

    IFS=$'\n'
    for DELETED_ENTRY in ${DELETED_ENTRIES}; do
        echo "  removing entry: ${DELETED_ENTRY}"
        DUMP=$(echo "${DUMP}" | { grep -v ", ${DELETED_ENTRY}, " || true; } | { grep -v "(${DELETED_ENTRY}, " || true; })
    done
    unset
fi

if [ "${IS_CLEAR_E2E}" = "true" ]; then
    DUMP=$(cat "${DUMP_FILE}")
    E2E_ENTRIES=$(
        echo "${DUMP}" |
            grep 'e2e-entry-' |
            grep 'public.entries' |
            grep -oE ", '[0-9]+/" |
            sed "s|, '||" |
            sed 's|/||' |
            tr -d ' ' |
            sort |
            uniq
    )

    IFS=$'\n'
    for E2E_ENTRY in ${E2E_ENTRIES}; do
        echo "  removing entry: ${E2E_ENTRY}"
        DUMP=$(echo "${DUMP}" | { grep -v ", ${E2E_ENTRY}, " || true; } | { grep -v "(${E2E_ENTRY}, " || true; })
    done
    unset
fi

E2E_ENTRIES=$(cat "${DUMP_FILE}" | { grep "e2e-entry-" || true; })
DELETED_ENTRIES=$(cat "${DUMP_FILE}" | { grep "__trash/" || true; })

if [ -n "${E2E_ENTRIES}" ]; then
    ENTRIES_KEYS=$(echo "${E2E_ENTRIES}" | sed -E "s|INSERT INTO ([^ ]+) .*'([^']*e2e-entry-[^']*)'.*|\1 - \2|" | sed 's|^|  - |')

    echo ""
    echo "⚠️ WARNING: Found entries with 'e2e-entry-' in key:" >&2
    echo "${ENTRIES_KEYS}" >&2
    echo "These entries might be test entries and should be reviewed..." >&2
fi

if [ -n "${DELETED_ENTRIES}" ]; then
    ENTRIES_KEYS=$(echo "${DELETED_ENTRIES}" | sed -E "s|INSERT INTO ([^ ]+) .*'([^']*__trash/[^']*)'.*|\1 - \2|" | sed 's|^|  - |')

    echo ""
    echo "⚠️ WARNING: Found deleted entries:" >&2
    echo "${ENTRIES_KEYS}" >&2
fi

EXIT="$?"

echo "COMMIT;" >>"${DUMP_FILE}"

# remove empty lines
sed '/^$/N;/^\n$/D' "${DUMP_FILE}" >"${DUMP_FILE}.tmp" && mv "${DUMP_FILE}.tmp" "${DUMP_FILE}"

if [ "${EXIT}" != "0" ]; then
    echo "Dump error, exit..."
    exit "${EXIT}"
else
    echo ""
    echo "Dump done, saved at [${DUMP_FILE}]"
    exit 0
fi
