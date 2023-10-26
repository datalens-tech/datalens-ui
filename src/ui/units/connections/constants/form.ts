export enum FieldKey {
    Accuracy = 'accuracy',
    Alias = 'alias',
    CacheTtlSec = 'cache_ttl_sec',
    Cluster = 'cluster',
    Credentials = 'credentials',
    /* * A field with the connector type that comes in the data of an already created entity*/
    DbType = 'db_type',
    DbName = 'db_name',
    DirPath = 'dir_path',
    Host = 'host',
    Id = 'id',
    Key = 'key',
    MdbFolderId = 'mdb_folder_id',
    Name = 'name',
    Password = 'password',
    Port = 'port',
    Portal = 'portal',
    RawSqlLevel = 'raw_sql_level',
    RefreshEnabled = 'refresh_enabled',
    ReplaceSources = 'replace_sources',
    RefreshToken = 'refresh_token',
    Schema = 'schema',
    Sources = 'sources',
    Token = 'token',
    /* * A field with the connector type that is used to create an entity*/
    Type = 'type',
    Url = 'url',
    Username = 'username',
    Warehouse = 'warehouse',
    WorkbookId = 'workbook_id',
}

export enum InnerFieldKey {
    Authorized = 'authorized',
    CacheTtlMode = 'cache_ttl_mode',
    isAutoCreateDashboard = 'is_auto_create_dashboard',
}
