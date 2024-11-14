#!/bin/bash

US_CONTAINER_NAME="e2e-datalens-pg-us"
US_DB_HOST="pg-us"
US_DB_USER="us"
US_DB_PASS="us"
US_DB_NAME="us-db-ci_purgeable"
US_DB_PORT=5432
US_DUMP_PATH="./tests/data/us-e2e-data"
US_CONNECTION="postgres://$US_DB_USER:$US_DB_PASS@$US_DB_HOST:$US_DB_PORT/$US_DB_NAME"
DUMP_TMP="/tmp/us-dump-"$(date +%Y-%m-%d_%H-%M-%S)""

echo "United Storage dump process"
echo

US_CONTAINER_ID=$(docker ps -aqf name="$US_CONTAINER_NAME")
US_CONTAINERS_NUMBER=$(echo $US_CONTAINER_ID | tr " " "\n" | wc -l | xargs)

if [ $US_CONTAINERS_NUMBER -gt 1 ]; then
    echo "Failed to match the \""$US_CONTAINER_NAME"\" container id."
    echo "It was expected to find 1 running container with the \""$US_CONTAINER_NAME"\" pattern however "$US_CONTAINERS_NUMBER" were found."
    echo
    echo "Please keep only 1 of those containers running."
    echo $US_CONTAINER_ID | tr " " "\n"
    exit 1
fi

if [ -z $US_CONTAINER_ID ]; then
    echo "Failed to locate \"$US_CONTAINER_NAME\" docker container id."
    exit 1
fi

CONNECTION_CHECK_CMD="pg_isready --dbname=$US_CONNECTION"
CONNECTION_CHECK_RESULT=$(docker exec -it $US_CONTAINER_ID /bin/sh -c "$CONNECTION_CHECK_CMD")
CONNECTION_CHECK_RESULT_STATUS_CODE=$?

if [ $CONNECTION_CHECK_RESULT_STATUS_CODE -ne 0 ]; then
    echo "Failed to establish database connection."
    echo $CONNECTION_CHECK_RESULT
    exit 1
fi

DUMP_CMD="pg_dump --dbname=$US_CONNECTION --column-inserts -a -t workbooks -t entries -t revisions -t links"
docker exec -it $US_CONTAINER_ID /bin/sh -c "$DUMP_CMD" | grep -Ev "^(--|SET|SELECT pg_catalog.set_config)" >$DUMP_TMP
DUMP_RESULT_STATUS_CODE=$?

if [ $DUMP_RESULT_STATUS_CODE -ne 0 ]; then
    echo "Failed to dump database."
    cat $DUMP_TMP
    rm $DUMP_TMP
    exit 1
fi

mv $DUMP_TMP $US_DUMP_PATH
echo "The dump was succesfully created in $US_DUMP_PATH."
exit 0
