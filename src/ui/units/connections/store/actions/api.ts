import {ConnectionData, TIMEOUT_65_SEC} from 'shared';
import {DL} from 'ui';

import {
    AddGoogleSheetResponse,
    AddYandexDocumentResponse,
    ApplySourceSettingsArgs,
    FormSchema,
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
import type {CheckData, UploadedFile} from '../typings';

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
        return await getSdk().googleapis.getAuthorizationUrl({scopes});
    } catch (error) {
        return {authorizationUrl: '', error};
    }
};

const getGoogleCredentials = async (
    code: string,
): Promise<GetGCredentialsResponse & {error?: DataLensApiError}> => {
    try {
        const response = await getSdk().googleapis.getCredentials({code});
        return response;
    } catch (error) {
        return {accessToken: '', error};
    }
};

const addYandexDocument = async ({
    authorized = false,
    privatePath,
    publicLink,
    oauthToken,
}: {
    authorized?: boolean;
    privatePath?: string;
    publicLink?: string;
    oauthToken?: string;
}): Promise<{document?: AddYandexDocumentResponse; error?: DataLensApiError}> => {
    try {
        const document = await getSdk().biConverter.addYandexDocument({
            authorized,
            type: 'yadocs',
            private_path: privatePath,
            public_link: publicLink,
            oauth_token: oauthToken,
        });
        return {document};
    } catch (error) {
        logger.logError('Redux actions (conn): addYadoc failed', error);
        return {error};
    }
};

export const api = {
    fetchEntry,
    fetchConnectionData,
    fetchConnectors,
    fetchConnectorSchema,
    fetchRenderedMarkdown,
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
    addYandexDocument,
};
