--
-- The sample data used in the superstore-sales database is taken from https://www.kaggle.com
-- which is licensed under the Open Data Commons Public Domain Dedication and License (PDDL) v1.0
--

BEGIN;

SET client_encoding = 'UTF8';
SET datestyle = dmy;

CREATE TABLE sales (
    id integer NOT NULL,
    order_id TEXT NOT NULL,
    order_date DATE NOT NULL,
    ship_date DATE NOT NULL,
    ship_mode TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    segment TEXT NOT NULL,
    country TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT,
    region TEXT NOT NULL,
    product_id TEXT NOT NULL,
    category TEXT NOT NULL,
    sub_category TEXT NOT NULL,
    product_name TEXT NOT NULL,
    sales TEXT NOT NULL 
);

COPY sales FROM '/init/post-init/superstore-sales.csv' DELIMITER ',' CSV HEADER;

ALTER TABLE ONLY sales ADD CONSTRAINT sales_pkey PRIMARY KEY (id);

COMMIT;

ANALYZE sales;