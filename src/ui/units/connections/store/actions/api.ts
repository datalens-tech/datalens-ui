import {ConnectionData, ConnectorType, type MdbAvailableDatabase, TIMEOUT_65_SEC} from 'shared';
import type {FormSchema} from 'shared/schema/types';
import {DL} from 'ui';

import {
    AddGoogleSheetResponse,
    ApplySourceSettingsArgs,
    GetAuthorizationUrlResponse,
    GetConnectorSchemaArgs,
    GetConnectorsResponse,
    GetEntryResponse,
    GetFileSourceStatusResponse,
    GetFileSourcesResponse,
    GetFileStatusResponse,
    GetGCredentialsResponse,
    GoogleRefreshToken,
    UpdateFileSourceArgs,
    UpdateFileSourceResponse,
    UpdateS3BasedConnectionDataArgs,
    UpdateS3BasedConnectionDataResponse,
} from '../../../../../shared/schema';
import logger from '../../../../libs/logger';
import {getSdk} from '../../../../libs/schematic-sdk';
import {sdk as oldSdk} from '../../../../libs/sdk';
import type {DataLensApiError} from '../../../../typings';
import {ManualError} from '../../../../utils/errors/manual';
import {ConverterErrorCode} from '../../constants';
import type {FormDict} from '../../typings';
import type {
    CheckData,
    CloudTree,
    GrpcServiceAccount,
    MdbBaseEntry,
    MdbClusterEntry,
    MdbEntryWithId,
    MdbHostEntry,
    UploadedFile,
    YdbDatabase,
} from '../typings';

const PAGE_SIZE_1000 = 1000;

const fetchEntry = async (
    entryId: string,
): Promise<{
    entry?: GetEntryResponse;
    error?: DataLensApiError;
}> => {
    try {
        const entry = await getSdk().us.getEntry({
            entryId,
            includePermissionsInfo: true,
        });
        return {entry};
    } catch (error) {
        logger.logError('Redux actions (conn): fetchEntry failed', error);
        return {entry: undefined, error};
    }
};

const fetchConnectionData = async (
    connectionId: string,
): Promise<{
    connectionData: ConnectionData;
    error?: DataLensApiError;
}> => {
    try {
        const connectionData = await getSdk().bi.getConnection({connectionId});
        return {connectionData};
    } catch (error) {
        logger.logError('Redux actions (conn): fetchConnectionData failed', error);
        return {connectionData: {}, error};
    }
};

const fetchConnectors = async (): Promise<
    GetConnectorsResponse & {
        error?: DataLensApiError;
    }
> => {
    try {
        return await getSdk().bi.getConnectors();
    } catch (error) {
        logger.logError('Redux actions (conn): fetchConnectors failed', error);
        return {result: [], error};
    }
};

const fetchConnectorSchema = async ({
    type,
    mode,
}: GetConnectorSchemaArgs): Promise<{
    schema?: FormSchema;
    error?: DataLensApiError;
}> => {
    try {
        const {form: schema} = await getSdk().bi.getConnectorSchema({type, mode});
        return {schema};
    } catch (error) {
        logger.logError('Redux actions (conn): fetchConnectorForm failed', error);
        return {error};
    }
};

const fetchRenderedMarkdown = async (text = '') => {
    try {
        const {result} = await getSdk().mix.renderMarkdown({
            text,
            lang: DL.USER_LANG,
        });

        return result;
    } catch (error) {
        logger.logError('Redux actions (conn): renderMarkdown failed', error);
        return '';
    }
};

const fetchMetricaCounters = async (token: string) => {
    try {
        // @ts-ignore OPENSOURCE MIGRATION
        const {counters} = await getSdk().metrica.getCounters({token});
        return counters;
    } catch (error) {
        logger.logError('Redux actions (conn): fetchMetricaCounters failed', error);
        return [];
    }
};

const fetchAppmetricaCounters = async (token: string) => {
    try {
        // @ts-ignore OPENSOURCE MIGRATION
        const {applications} = await getSdk().appmetrica.getApplications({token});
        return applications;
    } catch (error) {
        logger.logError('Redux actions (conn): fetchMetricaCounters failed', error);
        return [];
    }
};

const fetchMdbClusters = async (
    dbType: MdbAvailableDatabase,
    folderId?: string,
): Promise<{
    clusters: (MdbClusterEntry | MdbEntryWithId)[];
    error?: DataLensApiError;
}> => {
    try {
        if (!folderId) {
            throw new Error('CURRENT_TENANT_ID not specified');
        }

        let clusters: (MdbClusterEntry | MdbEntryWithId)[];

        switch (dbType) {
            case ConnectorType.Clickhouse:
                // @ts-ignore OPENSOURCE MIGRATION
                ({clusters} = await getSdk().managedClickhouse.listClusters({folderId}));
                break;
            case ConnectorType.Greenplum:
                // @ts-ignore OPENSOURCE MIGRATION
                ({clusters} = await getSdk().managedGreenplum.listClusters({folderId}));
                break;
            case ConnectorType.Postgres:
                // @ts-ignore OPENSOURCE MIGRATION
                ({clusters} = await getSdk().managedPostgresql.listClusters({folderId}));
                break;
            case ConnectorType.Mysql:
                // @ts-ignore OPENSOURCE MIGRATION
                ({clusters} = await getSdk().managedMysql.listClusters({folderId}));
                break;
            default:
                throw new Error(`Unknown dbType '${dbType}'`);
        }

        return {clusters};
    } catch (error) {
        return {clusters: [], error};
    }
};

const fetchMdbHosts = async (
    dbType: MdbAvailableDatabase,
    clusterId: string,
    tenantId?: string,
): Promise<{
    hosts: MdbHostEntry[];
    error?: DataLensApiError;
}> => {
    try {
        if (!tenantId) {
            throw new Error('CURRENT_TENANT_ID not specified');
        }

        let hosts: MdbHostEntry[] = [];

        switch (dbType) {
            case ConnectorType.Clickhouse:
                // @ts-ignore OPENSOURCE MIGRATION
                ({hosts} = await getSdk().managedClickhouse.listHosts({
                    clusterId,
                }));
                break;
            case ConnectorType.Greenplum:
                // @ts-ignore OPENSOURCE MIGRATION
                ({hosts} = await getSdk().managedGreenplum.listHosts({clusterId}));
                break;
            case ConnectorType.Postgres:
                // @ts-ignore OPENSOURCE MIGRATION
                ({hosts} = await getSdk().managedPostgresql.listHosts({
                    clusterId,
                    folderId: tenantId,
                }));
                break;
            case ConnectorType.Mysql:
                // @ts-ignore OPENSOURCE MIGRATION
                ({hosts} = await getSdk().managedMysql.listHosts({
                    clusterId,
                    folderId: tenantId,
                }));
                break;
            default:
                throw new Error(`Unknown or unsupported dbType '${dbType}'`);
        }

        return {hosts};
    } catch (error) {
        return {hosts: [], error};
    }
};

const fetchMdbUsers = async (
    dbType: MdbAvailableDatabase,
    clusterId: string,
    tenantId?: string,
): Promise<{
    users: MdbBaseEntry[];
    error?: DataLensApiError;
}> => {
    try {
        if (!tenantId) {
            throw new Error('CURRENT_TENANT_ID not specified');
        }

        let users: MdbBaseEntry[] = [];

        switch (dbType) {
            case ConnectorType.Clickhouse:
                // @ts-ignore OPENSOURCE MIGRATION
                ({users} = await getSdk().managedClickhouse.listUsers({
                    clusterId,
                }));
                break;
            case ConnectorType.Postgres:
                // @ts-ignore OPENSOURCE MIGRATION
                users = await getSdk().managedPostgresql.listUsers({
                    clusterId,
                    folderId: tenantId,
                });
                break;
            case ConnectorType.Mysql:
                // @ts-ignore OPENSOURCE MIGRATION
                users = await getSdk().managedMysql.listUsers({
                    clusterId,
                    folderId: tenantId,
                });
                break;
            default:
                throw new Error(`Unknown or unsupported dbType '${dbType}'`);
        }

        return {users};
    } catch (error) {
        return {users: [], error};
    }
};

const fetchMdbDatabases = async (
    dbType: MdbAvailableDatabase,
    clusterId: string,
    tenantId?: string,
): Promise<{
    databases: MdbBaseEntry[];
    error?: DataLensApiError;
}> => {
    try {
        if (!tenantId) {
            throw new Error('CURRENT_TENANT_ID not specified');
        }

        let databases: MdbBaseEntry[] = [];

        switch (dbType) {
            case ConnectorType.Clickhouse:
                // @ts-ignore OPENSOURCE MIGRATION
                ({databases} = await getSdk().managedClickhouse.listDatabases({
                    clusterId,
                }));
                break;
            case ConnectorType.Postgres:
                // @ts-ignore OPENSOURCE MIGRATION
                databases = await getSdk().managedPostgresql.listDatabases({
                    clusterId,
                    folderId: tenantId,
                });
                break;
            case ConnectorType.Mysql:
                // @ts-ignore OPENSOURCE MIGRATION
                databases = await getSdk().managedMysql.listDatabases({
                    clusterId,
                    folderId: tenantId,
                });
                break;
            default:
                throw new Error(`Unknown or unsupported dbType '${dbType}'`);
        }

        return {databases};
    } catch (error) {
        return {databases: [], error};
    }
};

const fetchCloudtree = async (): Promise<{
    cloudTree: CloudTree[];
    error?: DataLensApiError;
}> => {
    try {
        // @ts-ignore OPENSOURCE MIGRATION
        const {clouds: cloudTree} = await getSdk().resourceManager.getTree({
            pageSize: PAGE_SIZE_1000,
        });
        return {cloudTree};
    } catch (error) {
        logger.logError('Redux actions (conn): fetchCloudtree failed', error);
        return {cloudTree: [], error};
    }
};

const fetchServiceAccounts = async (
    tenantId: string,
): Promise<{
    serviceAccounts: GrpcServiceAccount[];
    error?: DataLensApiError;
}> => {
    try {
        // @ts-ignore OPENSOURCE MIGRATION
        const {serviceAccounts} = await getSdk().iam.listGrpcServiceAccounts({
            folderId: tenantId,
            pageSize: PAGE_SIZE_1000,
        });
        return {serviceAccounts};
    } catch (error) {
        logger.logError('Redux actions (conn): fetchServiceAccounts failed', error);
        return {serviceAccounts: [], error};
    }
};

const fetchYdbDatabases = async (
    tenantId: string,
): Promise<{
    databases: YdbDatabase[];
    error?: DataLensApiError;
}> => {
    try {
        // @ts-ignore OPENSOURCE MIGRATION
        const {databases} = await getSdk().ydb.listDatabases({folderId: tenantId});
        // This type is not described in cloud-schemas
        return {databases} as {databases: YdbDatabase[]};
    } catch (error) {
        logger.logError('Redux actions (conn): fetchYdbDatabases failed', error);
        return {databases: [], error};
    }
};

const createConnection = async (
    form: FormDict,
): Promise<{id?: string; error?: DataLensApiError}> => {
    try {
        const {id} = await getSdk().bi.createConnection(form);
        return {id};
    } catch (error) {
        logger.logError('Redux actions (conn): fetchMetricaCounters failed', error);
        return {error};
    }
};

const updateConnection = async (
    form: FormDict,
    connectionId: string,
): Promise<{error?: DataLensApiError}> => {
    try {
        await getSdk().bi.updateConnection({...form, connectionId});
        return {error: undefined};
    } catch (error) {
        logger.logError('Redux actions (conn): fetchMetricaCounters failed', error);
        return {error};
    }
};

const checkConnectionParams = async (params: FormDict): Promise<CheckData> => {
    try {
        await getSdk().bi.verifyConnectionParams(params);
        return {status: 'success', error: undefined};
    } catch (error) {
        logger.logError('Redux actions (conn): checkConnectionParams failed', error);
        return {status: 'error', error};
    }
};

const checkConnection = async (params: FormDict, connectionId: string): Promise<CheckData> => {
    try {
        await getSdk().bi.verifyConnection({...params, connectionId});
        return {status: 'success', error: undefined};
    } catch (error) {
        logger.logError('Redux actions (conn): checkConnection failed', error);
        return {status: 'error', error};
    }
};

const copyTemplate = async (
    connectionId: string,
    templateName: string,
): Promise<{
    entryId?: string;
    error?: DataLensApiError;
}> => {
    try {
        const {entryId} = await getSdk().us.copyTemplate(
            {connectionId, templateName},
            {timeout: TIMEOUT_65_SEC},
        );
        return {entryId, error: undefined};
    } catch (error) {
        logger.logError('Redux actions (conn): copyTemplate failed', error);
        return {entryId: undefined, error};
    }
};

const uploadFile = async (file: File): Promise<UploadedFile> => {
    try {
        const formData = new FormData();
        const useComEndpoint = location.hostname.endsWith('.com');
        formData.append('file', file);
        const {file_id: id} = await oldSdk.sendFileInConnectionUploaderV2(
            {formData, useComEndpoint},
            {passTimezoneOffset: false},
        );
        return {file, id};
    } catch (error) {
        logger.logError('Redux actions (conn): uploadFile failed', error);
        return {file, id: '', error};
    }
};

const checkFileStatus = async (
    fileId: string,
): Promise<{status: GetFileStatusResponse['status']; error?: DataLensApiError}> => {
    try {
        const {status, error} = await getSdk().biConverter.getFileStatus({fileId});

        if (status === 'failed') {
            const code = error?.code;
            const manualError = new ManualError({
                message: 'File check failed',
                code,
                ...(code === ConverterErrorCode.PERMISSION_DENIED && {status: 403}),
            });

            throw manualError;
        }

        return {status};
    } catch (error) {
        logger.logError('Redux actions (conn): checkFileStatus failed', error);
        return {status: 'failed', error};
    }
};

const checkFileSourceStatus = async (
    fileId: string,
    sourceId: string,
): Promise<{status: GetFileSourceStatusResponse['status']; error?: DataLensApiError}> => {
    try {
        const {status} = await getSdk().biConverter.getFileSourceStatus({
            fileId,
            sourceId,
        });

        if (status === 'failed') {
            throw new Error('Status check failed');
        }

        return {status};
    } catch (error) {
        // This crutch asked to add a backend:
        // 404 is obtained at the starting pollingsource, which was replaced
        if (error.status === 404) {
            return {status: 'in_progress'};
        }

        logger.logError('Redux actions (conn): checkFileSourceStatus failed', error);

        return {status: 'failed', error};
    }
};

const fetchFileSources = async (
    fileId: string,
): Promise<{sources: GetFileSourcesResponse['sources']; error?: DataLensApiError}> => {
    try {
        const {sources} = await getSdk().biConverter.getFileSources({fileId});
        return {sources};
    } catch (error) {
        logger.logError('Redux actions (conn): fetchFileSources failed', error);
        return {sources: [], error};
    }
};

const updateFileSource = async (
    fileId: string,
    sourceId: string,
    columnTypes?: UpdateFileSourceArgs['column_types'],
): Promise<{source: UpdateFileSourceResponse} | {sourceId: string; error: DataLensApiError}> => {
    try {
        const source = await getSdk().biConverter.updateFileSource({
            fileId,
            sourceId,
            column_types: columnTypes,
        });
        return {source};
    } catch (error) {
        logger.logError('Redux actions (conn): updateFileSource failed', error);
        return {sourceId, error};
    }
};

const applySourceSettings = async (
    fileId: string,
    sourceId: string,
    settings: ApplySourceSettingsArgs['data_settings'],
    title?: string,
): Promise<{error?: DataLensApiError}> => {
    try {
        await getSdk().biConverter.applySourceSettings({
            fileId,
            sourceId,
            data_settings: settings,
            title,
        });
        return {};
    } catch (error) {
        logger.logError('Redux actions (conn): applySourceSettings failed', error);
        return {error};
    }
};

const addGoogleSheet = async ({
    url,
    authorized,
    connectionId,
    refreshToken,
}: {
    url: string;
    authorized: boolean;
    connectionId?: string;
    refreshToken?: GoogleRefreshToken;
}): Promise<{gsheet?: AddGoogleSheetResponse; error?: DataLensApiError}> => {
    try {
        const gsheet = await getSdk().biConverter.addGoogleSheet({
            type: 'gsheets',
            url,
            authorized,
            connection_id: connectionId,
            refresh_token: refreshToken,
        });
        return {gsheet};
    } catch (error) {
        logger.logError('Redux actions (conn): addGoogleSheet failed', error);
        return {error};
    }
};

const updateS3BasedConnectionData = async (
    args: UpdateS3BasedConnectionDataArgs,
): Promise<{files: UpdateS3BasedConnectionDataResponse['files']; error?: DataLensApiError}> => {
    try {
        const {files} = await getSdk().biConverter.updateS3BasedConnectionData(args);
        return {files};
    } catch (error) {
        logger.logError('Redux actions (conn): addGoogleSheet failed', error);
        return {files: [], error};
    }
};

const getGoogleAuthorizationUrl = async (): Promise<
    GetAuthorizationUrlResponse & {error?: DataLensApiError}
> => {
    const scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
    try {
        // @ts-ignore OPENSOURCE MIGRATION
        return await getSdk().googleapis.getAuthorizationUrl({scopes});
    } catch (error) {
        return {authorizationUrl: '', error};
    }
};

const getGoogleCredentials = async (
    code: string,
): Promise<GetGCredentialsResponse & {error?: DataLensApiError}> => {
    try {
        // @ts-ignore OPENSOURCE MIGRATION
        const response = await getSdk().googleapis.getCredentials({code});
        return response;
    } catch (error) {
        return {accessToken: '', error};
    }
};

export const api = {
    fetchEntry,
    fetchConnectionData,
    fetchConnectors,
    fetchConnectorSchema,
    fetchRenderedMarkdown,
    fetchMetricaCounters,
    fetchAppmetricaCounters,
    fetchMdbClusters,
    fetchMdbHosts,
    fetchMdbUsers,
    fetchMdbDatabases,
    fetchCloudtree,
    fetchServiceAccounts,
    fetchYdbDatabases,
    createConnection,
    updateConnection,
    checkConnectionParams,
    checkConnection,
    copyTemplate,
    uploadFile,
    checkFileStatus,
    checkFileSourceStatus,
    fetchFileSources,
    updateFileSource,
    applySourceSettings,
    addGoogleSheet,
    updateS3BasedConnectionData,
    getGoogleAuthorizationUrl,
    getGoogleCredentials,
};
