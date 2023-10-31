US_DOCKER_CONTAINER_NAME="datalens-pg-us"
US_DB_HOST="pg-us"
US_DB_USER="us"
US_DB_PASS="us"
US_DB_NAME="us-db-ci_purgeable"
US_DB_PORT=5432
US_DUMP_PATH="./tests/data/us-e2e-data"
CONNECTION="postgres://$US_DB_USER:$US_DB_PASS@$US_DB_HOST:$US_DB_PORT/$US_DB_NAME"

echo "United Storage dump process"
echo

US_ID=$(docker ps -aqf name="$US_DOCKER_CONTAINER_NAME")

if [ -z $US_ID ]; then
    echo "Failed to locate $US_DOCKER_CONTAINER_NAME docker container id."
    exit 1
fi

CONNECTION_CHECK_CMD="pg_isready --dbname=$CONNECTION"
CONNECTION_CHECK_RESULT=$(docker exec -it $US_ID /bin/sh -c "$CONNECTION_CHECK_CMD")
CONNECTION_STATUS_CODE=$?

if [ $CONNECTION_STATUS_CODE -ne 0 ]; then
    echo "Failed to establish database connection."
    echo $CONNECTION_CHECK_RESULT
    exit 1
fi

DUMP_CMD="pg_dump --dbname=$CONNECTION --column-inserts -a -t workbooks -t entries -t revisions -t links"
DUMP_RESULT=$(docker exec -it $US_ID /bin/sh -c "$DUMP_CMD")
DUMP_STATUS_CODE=$?

if [ $DUMP_STATUS_CODE -ne 0 ]; then
    echo "Failed to dump database."
    echo $DUMP_RESULT
    exit 1
fi

echo $DUMP_RESULT > $US_DUMP_PATH
echo "The dump was succesfully created in $US_DUMP_PATH."
exit 0
