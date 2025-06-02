import {ConnectorType} from '../constants';

export const DATALENS_QL_CONNECTION_TYPES = {
    CLICKHOUSE: ConnectorType.Clickhouse,
    MSSQL: ConnectorType.Mssql,
    MYSQL: ConnectorType.Mysql,
    ORACLE: ConnectorType.Oracle,
    POSTGRESQL: ConnectorType.Postgres,
    TRINO: ConnectorType.Trino,
    YQL: ConnectorType.Yq, // YDB, YQ
    PROMQL: ConnectorType.Promql,
    MONITORING: ConnectorType.Monitoring,
};

const YQL_TYPES = {
    BOOL: 'Bool',
    DATE: 'Date',
    DATETIME: 'Datetime',
    DATETIMETZ: 'DatetimeTZ',
    UUID: 'UUID',
    STRING: 'String',
    DOUBLE: 'Double',
    INT64: 'Int64',
};

const CLICKHOUSE_TYPES = {
    DATE: 'Date',
    DATETIME: 'DateTime',
    DATETIME64: 'DateTime64',
    ENUM8: 'Enum8',
    ENUM16: 'Enum16',
    UUID: 'UUID',
    STRING: 'String',
    FIXEDSTRING: 'FixedString',
    FLOAT32: 'Float32',
    FLOAT64: 'Float64',
    DECIMAL: 'Decimal',
    INT8: 'Int8',
    INT16: 'Int16',
    INT32: 'Int32',
    INT64: 'Int64',
    UINT8: 'UInt8',
    UINT16: 'UInt16',
    UINT32: 'UInt32',
    UINT64: 'UInt64',
};

const CLICKHOUSE_TO_YQL_BASE: Record<string, string> = {
    [CLICKHOUSE_TYPES.DATE]: YQL_TYPES.DATE,
    [CLICKHOUSE_TYPES.DATETIME]: YQL_TYPES.DATETIME,
    [CLICKHOUSE_TYPES.UUID]: YQL_TYPES.UUID,
    [CLICKHOUSE_TYPES.STRING]: YQL_TYPES.STRING,
    [CLICKHOUSE_TYPES.FIXEDSTRING]: YQL_TYPES.STRING,
    [CLICKHOUSE_TYPES.FLOAT32]: YQL_TYPES.DOUBLE,
    [CLICKHOUSE_TYPES.FLOAT64]: YQL_TYPES.DOUBLE,
    [CLICKHOUSE_TYPES.DECIMAL]: YQL_TYPES.DOUBLE,
    [CLICKHOUSE_TYPES.INT8]: YQL_TYPES.INT64,
    [CLICKHOUSE_TYPES.INT16]: YQL_TYPES.INT64,
    [CLICKHOUSE_TYPES.INT32]: YQL_TYPES.INT64,
    [CLICKHOUSE_TYPES.INT64]: YQL_TYPES.INT64,
    [CLICKHOUSE_TYPES.UINT8]: YQL_TYPES.INT64,
    [CLICKHOUSE_TYPES.UINT16]: YQL_TYPES.INT64,
    [CLICKHOUSE_TYPES.UINT32]: YQL_TYPES.INT64,
    [CLICKHOUSE_TYPES.UINT64]: YQL_TYPES.INT64,
};

const CLICKHOUSE_TO_YQL: Record<string, string> = Object.keys(CLICKHOUSE_TO_YQL_BASE).reduce(
    (res, key) => {
        const val = CLICKHOUSE_TO_YQL_BASE[key];
        return {
            ...res,
            [key]: val,
            [`Nullable(${key})`]: val,
            [`LowCardinality(${key})`]: val,
            [`LowCardinality(Nullable(${key}))`]: val,
        };
    },
    {},
);

const CLICKHOUSE_TO_YQL_PREFIX_BASE: Record<string, string> = {
    [CLICKHOUSE_TYPES.DECIMAL]: YQL_TYPES.DOUBLE,
    [CLICKHOUSE_TYPES.DATETIME]: YQL_TYPES.DATETIMETZ,
    [CLICKHOUSE_TYPES.DATETIME64]: YQL_TYPES.DATETIMETZ,
    [CLICKHOUSE_TYPES.ENUM8]: YQL_TYPES.STRING,
    [CLICKHOUSE_TYPES.ENUM8]: YQL_TYPES.STRING,
};

const CLICKHOUSE_TO_YQL_PREFIX: Record<string, string> = Object.keys(
    CLICKHOUSE_TO_YQL_PREFIX_BASE,
).reduce((res, key) => {
    const val = CLICKHOUSE_TO_YQL_PREFIX_BASE[key];
    return {
        ...res,
        [key]: val,
        [`Nullable(${key}`]: val,
        [`LowCardinality(${key}`]: val,
        [`LowCardinality(Nullable(${key}`]: val,
    };
}, {});

function clickhouseToYQL(typeName: string) {
    let result = CLICKHOUSE_TO_YQL[typeName];
    if (result) {
        return result;
    }

    const pieces = typeName.split('(');
    for (let i = 1; i <= 3; ++i) {
        result = CLICKHOUSE_TO_YQL_PREFIX[pieces.slice(0, i).join('(')];
        if (result) {
            return result;
        }
    }

    return undefined;
}

const POSTGRESQL_TYPES = {
    BOOL: 'bool',
    INT2: 'int2',
    INT4: 'int4',
    INT8: 'int8',
    OID: 'oid',
    TEXT: 'text',
    CHAR: 'char',
    VARCHAR: 'varchar',
    NAME: 'name',
    ENUM: 'enum',
    FLOAT4: 'float4',
    FLOAT8: 'float8',
    NUMERIC: 'numeric',
    DATE: 'date',
    TIMESTAMP: 'timestamp',
    TIMESTAMPTZ: 'timestamptz',
    UUID: 'uuid',
};

const POSTGRESQL_TO_YQL: Record<string, string> = {
    [POSTGRESQL_TYPES.BOOL]: YQL_TYPES.BOOL,
    [POSTGRESQL_TYPES.INT2]: YQL_TYPES.INT64,
    [POSTGRESQL_TYPES.INT4]: YQL_TYPES.INT64,
    [POSTGRESQL_TYPES.INT8]: YQL_TYPES.INT64,
    [POSTGRESQL_TYPES.OID]: YQL_TYPES.INT64,
    [POSTGRESQL_TYPES.TEXT]: YQL_TYPES.STRING,
    [POSTGRESQL_TYPES.CHAR]: YQL_TYPES.STRING,
    [POSTGRESQL_TYPES.VARCHAR]: YQL_TYPES.STRING,
    [POSTGRESQL_TYPES.NAME]: YQL_TYPES.STRING,
    [POSTGRESQL_TYPES.ENUM]: YQL_TYPES.STRING,
    [POSTGRESQL_TYPES.FLOAT4]: YQL_TYPES.DOUBLE,
    [POSTGRESQL_TYPES.FLOAT8]: YQL_TYPES.DOUBLE,
    [POSTGRESQL_TYPES.NUMERIC]: YQL_TYPES.DOUBLE,
    [POSTGRESQL_TYPES.DATE]: YQL_TYPES.DATE,
    [POSTGRESQL_TYPES.TIMESTAMP]: YQL_TYPES.DATETIME,
    [POSTGRESQL_TYPES.TIMESTAMPTZ]: YQL_TYPES.DATETIMETZ,
    [POSTGRESQL_TYPES.UUID]: YQL_TYPES.UUID,
};

function postgreSQLToYQL(typeName: string) {
    return POSTGRESQL_TO_YQL[typeName];
}

export const DATALENS_QL_TYPES = {
    BOOLEAN: 'boolean',
    NUMBER: 'number',
    STRING: 'string',
    DATE: 'date',
    DATETIME: 'datetime',
    UNKNOWN: 'unknown',
};

const YQL_TO_DATALENS_SQL: Record<string, string> = {
    [YQL_TYPES.BOOL]: DATALENS_QL_TYPES.BOOLEAN,
    [YQL_TYPES.INT64]: DATALENS_QL_TYPES.NUMBER,
    [YQL_TYPES.STRING]: DATALENS_QL_TYPES.STRING,
    [YQL_TYPES.DOUBLE]: DATALENS_QL_TYPES.NUMBER,
    [YQL_TYPES.DATE]: DATALENS_QL_TYPES.DATE,
    [YQL_TYPES.DATETIME]: DATALENS_QL_TYPES.DATETIME,
    [YQL_TYPES.DATETIMETZ]: DATALENS_QL_TYPES.DATETIME,
    [YQL_TYPES.UUID]: DATALENS_QL_TYPES.STRING,
};

const BI_TYPES = {
    // Without: geopoint, geopolygon, markup, unsupported
    STRING: 'string',
    INTEGER: 'integer',
    FLOAT: 'float',
    DATE: 'date',
    DATETIME: 'datetime',
    DATETIMETZ: 'datetimetz',
    GENERICDATETIME: 'genericdatetime',
    BOOLEAN: 'boolean',
    UUID: 'uuid',
};

const BI_TO_DATALENS_SQL: Record<string, string> = {
    [BI_TYPES.STRING]: DATALENS_QL_TYPES.STRING,
    [BI_TYPES.INTEGER]: DATALENS_QL_TYPES.NUMBER,
    [BI_TYPES.FLOAT]: DATALENS_QL_TYPES.NUMBER,
    [BI_TYPES.DATE]: DATALENS_QL_TYPES.DATE,
    [BI_TYPES.DATETIME]: DATALENS_QL_TYPES.DATETIME,
    [BI_TYPES.DATETIMETZ]: DATALENS_QL_TYPES.DATETIME,
    [BI_TYPES.GENERICDATETIME]: DATALENS_QL_TYPES.DATETIME,
    [BI_TYPES.BOOLEAN]: DATALENS_QL_TYPES.BOOLEAN,
    [BI_TYPES.UUID]: DATALENS_QL_TYPES.STRING,
};

function yqlToDatalensQL(typeName: string | undefined) {
    return typeName
        ? YQL_TO_DATALENS_SQL[typeName] || DATALENS_QL_TYPES.UNKNOWN
        : DATALENS_QL_TYPES.UNKNOWN;
}

export function biToDatalensQL(typeName: string | undefined) {
    return typeName
        ? BI_TO_DATALENS_SQL[typeName] || DATALENS_QL_TYPES.UNKNOWN
        : DATALENS_QL_TYPES.UNKNOWN;
}

export function getDatalensQLTypeName(typeName: string | number, connectionType: string) {
    let yqlType: string | undefined = DATALENS_QL_TYPES.UNKNOWN;

    if (connectionType === DATALENS_QL_CONNECTION_TYPES.CLICKHOUSE) {
        yqlType = clickhouseToYQL(typeName as string);
    } else if (connectionType === DATALENS_QL_CONNECTION_TYPES.POSTGRESQL) {
        yqlType = postgreSQLToYQL(typeName as string);
    } else {
        return yqlType;
    }

    return yqlToDatalensQL(yqlType);
}
