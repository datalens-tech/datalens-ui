US_DOCKER_CONTAINER_NAME="datalens-pg-us"
US_DB_HOST="pg-us"
US_DB_USER="us"
US_DB_PASS="us"
US_DB_NAME="us-db-ci_purgeable"
US_DB_PORT=5432
US_DUMP_PATH="./tests/data/us-e2e-data"

echo "United Storage dump process"

US_ID=$(docker ps -aqf name="$US_DOCKER_CONTAINER_NAME")

echo "UnitedStorage container id: $US_ID"

CONNECTION="postgres://$US_DB_USER:$US_DB_PASS@$US_DB_HOST:$US_DB_PORT/$US_DB_NAME"
CMD="pg_dump --dbname=$CONNECTION --column-inserts -a -t workbooks -t entries -t revisions -t links"

docker exec -it $US_ID /bin/sh -c "$CMD" > "$US_DUMP_PATH"

echo "The dump was succesfully created in $US_DUMP_PATH"