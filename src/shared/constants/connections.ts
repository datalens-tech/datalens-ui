export enum ConnectorType {
    /** Special value for connectors union. Used to render nested pages with their own connectors list */
    __Meta__ = '__meta__',
    AppMetrica = 'appmetrica_api',
    Bigquery = 'bigquery',
    Bitrix = 'bitrix',
    Bitrix24 = 'bitrix24',
    ChBillingAnalytics = 'ch_billing_analytics',
    ChFrozenBumpyRoads = 'ch_frozen_bumpy_roads',
    ChFrozenCovid = 'ch_frozen_covid',
    ChFrozenDemo = 'ch_frozen_demo',
    ChFrozenDtp = 'ch_frozen_dtp',
    ChFrozenGkh = 'ch_frozen_gkh',
    ChFrozenHoreca = 'ch_frozen_horeca',
    ChFrozenSamples = 'ch_frozen_samples',
    ChFrozenTransparency = 'ch_frozen_transparency',
    ChFrozenWeather = 'ch_frozen_weather',
    ChGeoFiltered = 'ch_geo_filtered',
    ChOverYt = 'ch_over_yt',
    ChOverYtUserAuth = 'ch_over_yt_user_auth',
    ChYaMusicPodcastStats = 'ch_ya_music_podcast_stats',
    Chydb = 'chydb',
    Clickhouse = 'clickhouse',
    Csv = 'csv',
    Equeo = 'equeo',
    File = 'file',
    Greenplum = 'greenplum',
    Gsheets = 'gsheets',
    GsheetsV2 = 'gsheets_v2',
    KonturMarket = 'kontur_market',
    MetrikaApi = 'metrika_api',
    Moysklad = 'moysklad',
    Mssql = 'mssql',
    Mysql = 'mysql',
    Oracle = 'oracle',
    Postgres = 'postgres',
    Snowflake = 'snowflake',
    UsageTrackingYT = 'usage_tracking_ya_team',
    Ydb = 'ydb',
    Yt = 'yt',
    Yq = 'yq',
    Promql = 'promql',
    Monitoring = 'solomon',
    MonitoringExt = 'monitoring',
    KpInterestIndex = 'kp_interest_index',
    SchoolbookJournal = 'schoolbook_journal',
    SmbHeatmaps = 'smb_heatmaps',
    Chyt = 'chyt',
    ChytNb = 'chyt_nb',
    Extractor1c = 'extractor1c',
    Yadocs = 'yadocs',
    MonitoringV2 = 'monitoring_v2',
}

export type ActualConnectorType =
    | ConnectorType.ChOverYt
    | ConnectorType.ChOverYtUserAuth
    | ConnectorType.Gsheets
    | ConnectorType.GsheetsV2
    | ConnectorType.File;

export const enum ConnectionQueryTypeValues {
    GenericQuery = 'generic_query',
    GenericLabelValues = 'generic_label_values',
}

export enum DbConnectMethod {
    ServiceName = 'service_name',
    Sid = 'sid',
}

export enum EnforceCollate {
    Auto = 'auto',
    On = 'on',
    Off = 'off',
}

export enum RawSQLLevel {
    Off = 'off',
    Subselect = 'subselect',
    Dashsql = 'dashsql',
    Unknown = 'unknown',
}

export enum CSVEncoding {
    Utf8 = 'utf8',
    Windows1251 = 'windows1251',
    Utf8sig = 'utf8sig',
}

export enum CSVDelimiter {
    Comma = 'comma',
    Semicolon = 'semicolon',
    Tab = 'tab',
}

export const MDB_AVAILABLE_BASES = [
    ConnectorType.Clickhouse,
    ConnectorType.Greenplum,
    ConnectorType.Mysql,
    ConnectorType.Postgres,
] as const;

// This type contains here (in constants file) because of possible circular dependencies
export type MdbAvailableDatabase = typeof MDB_AVAILABLE_BASES[number];
