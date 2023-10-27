# Setting up a sales database
psql -f /opt/e2e-data/create-sales-db.sql postgres://world:world123@postgres-connection/postgres

# Filling data into the sales database
psql -f /opt/e2e-data/superstore-sales.sql postgres://e2e:e2e@postgres-connection/sales