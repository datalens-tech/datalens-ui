const CHARTS_API_SCHEMA = require('./charts').default;

const SCHEMA_API = {
    charts: {
        ...CHARTS_API_SCHEMA,
    },
};

export const oldSchema = SCHEMA_API;
