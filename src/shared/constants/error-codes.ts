// List of all error codes, if we need new - add it here.

export enum ErrorCode {
    SourceConfigTableNotConfigured = 'ERR.DS_API.SOURCE_CONFIG.TABLE_NOT_CONFIGURED',
    DbCannotParseDatetime = 'ERR.DS_API.DB.CANNOT_PARSE.DATETIME',
    DbCannotParseNumber = 'ERR.DS_API.DB.CANNOT_PARSE.NUMBER',
    DbJoinColumnTypeMismatch = 'ERR.DS_API.DB.JOIN_COLUMN_TYPE_MISMATCH',
    DbMaterizalizationNotFinished = 'ERR.DS_API.DB.MATERIALIZATION_NOT_FINISHED',
    DbMemoryLimitExceeded = 'ERR.DS_API.DB.MEMORY_LIMIT_EXCEEDED',
    ChytTableAccessDenied = 'ERR.DS_API.DB.CHYT.TABLE_ACCESS_DENIED',
    ChytTableHasNoSchema = 'ERR.DS_API.DB.CHYT.TABLE_HAS_NO_SCHEMA',
    ChytInvalidJoinMoreThanOneTable = 'ERR.DS_API.DB.CHYT.INVALID_SORTED_JOIN.MORE_THAN_ONE_TABLE',
    ChytInvalidJoinNotKeyColumn = 'ERR.DS_API.DB.CHYT.INVALID_SORTED_JOIN.NOT_A_KEY_COLUMN',
    ChytInvalidJoinNotKeyPrefixColumn = 'ERR.DS_API.DB.CHYT.INVALID_SORTED_JOIN.NOT_KEY_PREFIX_COLUMN',
    ValidationAggDouble = 'ERR.DS_API.VALIDATION.AGG.DOUBLE',
    ValidationAggInconsistent = 'ERR.DS_API.VALIDATION.AGG.INCONSISTENT',
    ValidationWinFuncNoAgg = 'ERR.DS_API.VALIDATION.WIN_FUNC.NO_AGG',
    DBError = 'ERR.DS_API.DB',
    DBQueryError = 'ERR.DS_API.DB.INVALID_QUERY',
    DBSourceDoesntExist = 'ERR.DS_API.DB.SOURCE_DOES_NOT_EXIST',
    SourceTimeout = 'ERR.DS_API.DB.SOURCE_ERROR.TIMEOUT',
    SourceInvalidResponse = 'ERR.DS_API.DB.SOURCE_ERROR.INVALID_RESPONSE',
    SourceClosedPrematurely = 'ERR.DS_API.DB.SOURCE_ERROR.CLOSED_PREMATURELY',
    UsAccessDenied = 'ERR.DS_API.US.ACCESS_DENIED',
    WorkbookIsolationInterruptionDenied = 'ERR.DS_API.US.WORKBOOK_ISOLATION_INTERRUPTION',
    ReferencedEntryAccessDenied = 'ERR.DS_API.REFERENCED_ENTRY_ACCESS_DENIED',
    NeedReset = 'NEED_RESET',
    MigrationOrgExists = 'MIGRATION_ORG_EXISTS',
    MigrationDenied = 'MIGRATION_DENIED',
    AccessServicePermissionDenied = 'ACCESS_SERVICE_PERMISSION_DENIED',
    AccessServiceUnauthenticated = 'ACCESS_SERVICE_UNAUTHENTICATED',
    EntryIsLocked = 'ERR.US.ENTRY_IS_LOCKED',
    EntryAlreadyExists = 'ERR.US.ENTRY_ALREADY_EXISTS',
    UsUniqViolation = 'ERR.US.DB.UNIQUE_VIOLATION',
    ReadOnlyMode = 'READ_ONLY_MODE_ENABLED',
}

export const ErrorContentTypes = {
    NOT_FOUND: 'not-found',
    NOT_FOUND_BY_RESOLVE_TENANT: 'not-found-by-resolve-tenant',
    NOT_FOUND_CURRENT_CLOUD_FOLDER: 'not-found-current-cloud-folder',
    CLOUD_FOLDER_ACCESS_DENIED: 'cloud-folder-access-denied',
    NO_ACCESS: 'no-access',
    NO_ENTRY_ACCESS: 'no-entry-access',
    ERROR: 'error',
    CREDENTIALS: 'credentials',
    AUTH_FAILED: 'auth-failed',
    AUTH_DENIED: 'auth-denied',
    NEW_ORGANIZATION_USER: 'new-organization-user',
    NEW_LOCAL_FEDERATION_USER: 'new-local-federation-user',
    INACCESSIBLE_ON_MOBILE: 'inaccessible-on-mobile',
    NOT_AUTHENTICATED: 'not-authenticated',
};
