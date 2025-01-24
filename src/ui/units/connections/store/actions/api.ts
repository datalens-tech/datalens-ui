import type {ConnectionData} from 'shared';
import {TIMEOUT_65_SEC} from 'shared';
import {CounterName, GoalId, reachMetricaGoal} from 'ui/libs/metrica';
import {registry} from 'ui/registry';

import type {
    AddGoogleSheetResponse,
    AddYandexDocumentResponse,
    ApplySourceSettingsArgs,
    DownloadPresignedUrlArgs,
    DownloadPresignedUrlResponse,
    FormSchema,
    GetConnectorSchemaArgs,
    GetConnectorsResponse,
    GetEntryResponse,
    GetFileSourceStatusResponse,
    GetFileSourcesResponse,
    GetFileStatusResponse,
    GetOAuthTokenArgs,
    GetOAuthTokenResponse,
    GetOAuthUriArgs,
    GetOAuthUriResponse,
    GetPresignedUrlResponse,
    RefreshToken,
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
        const entry = await getSdk().sdk.us.getEntry({
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
    workbookId: string | null,
): Promise<{
    connectionData: ConnectionData;
    error?: DataLensApiError;
}> => {
    try {
        const connectionData = await getSdk().sdk.bi.getConnection({connectionId, workbookId});
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
        return await getSdk().sdk.bi.getConnectors();
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
        const {form: schema} = await getSdk().sdk.bi.getConnectorSchema({type, mode});
        return {schema};
    } catch (error) {
        logger.logError('Redux actions (conn): fetchConnectorForm failed', error);
        return {error};
    }
};

const fetchRenderedMarkdown = async (text = '') => {
    try {
        const fetchRenderedMarkdownFn = registry.common.functions.get('fetchRenderedMarkdown');
        const {result} = await fetchRenderedMarkdownFn(text);

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
        const {id} = await getSdk().sdk.bi.createConnection(form);
        reachMetricaGoal(CounterName.Main, GoalId.ConnectionCreateSubmit, {
            type: form.type,
        });
        return {id};
    } catch (error) {
        logger.logError('Redux actions (conn): fetchMetricaCounters failed', error);
        return {error};
    }
};

const updateConnection = async (
    form: FormDict,
    connectionId: string,
    dbType: string,
): Promise<{error?: DataLensApiError}> => {
    try {
        await getSdk().sdk.bi.updateConnection({...form, connectionId});
        reachMetricaGoal(CounterName.Main, GoalId.ConnectionEditSubmit, {
            type: dbType,
        });
        return {error: undefined};
    } catch (error) {
        logger.logError('Redux actions (conn): fetchMetricaCounters failed', error);
        return {error};
    }
};

const checkConnectionParams = async (params: FormDict): Promise<CheckData> => {
    try {
        await getSdk().sdk.bi.verifyConnectionParams(params);
        return {status: 'success', error: undefined};
    } catch (error) {
        logger.logError('Redux actions (conn): checkConnectionParams failed', error);
        return {status: 'error', error};
    }
};

const checkConnection = async (
    params: FormDict,
    connectionId: string,
    workbookId: string | null,
): Promise<CheckData> => {
    try {
        await getSdk().sdk.bi.verifyConnection({...params, connectionId, workbookId});
        return {status: 'success', error: undefined};
    } catch (error) {
        logger.logError('Redux actions (conn): checkConnection failed', error);
        return {status: 'error', error};
    }
};

const copyTemplate = async (
    connectionId: string,
    templateName: string,
    workbookId?: string,
): Promise<{
    entryId?: string;
    error?: DataLensApiError;
    workbookId?: string;
}> => {
    try {
        const {entryId, workbookId: templateWorkbookId} = await getSdk().sdk.us.copyTemplate(
            {connectionId, templateName, workbookId},
            {timeout: TIMEOUT_65_SEC},
        );
        return {entryId, workbookId: templateWorkbookId, error: undefined};
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
        const {status, error} = await getSdk().sdk.biConverter.getFileStatus({fileId});

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
        const {status} = await getSdk().sdk.biConverter.getFileSourceStatus({
            fileId,
            sourceId,
        });

        if (status === 'failed') {
            throw new Error('Status check failed');
        }

        return {status};
    } catch (error) {
        logger.logError('Redux actions (conn): checkFileSourceStatus failed', error);
        return {status: 'failed', error};
    }
};

const fetchFileSources = async (
    fileId: string,
): Promise<{sources: GetFileSourcesResponse['sources']; error?: DataLensApiError}> => {
    try {
        const {sources} = await getSdk().sdk.biConverter.getFileSources({fileId});
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
        const source = await getSdk().sdk.biConverter.updateFileSource({
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
        await getSdk().sdk.biConverter.applySourceSettings({
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
    refreshToken?: RefreshToken;
}): Promise<{gsheet?: AddGoogleSheetResponse; error?: DataLensApiError}> => {
    try {
        const gsheet = await getSdk().sdk.biConverter.addGoogleSheet({
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
        const {files} = await getSdk().sdk.biConverter.updateS3BasedConnectionData(args);
        return {files};
    } catch (error) {
        logger.logError('Redux actions (conn): addGoogleSheet failed', error);
        return {files: [], error};
    }
};

const addYandexDocument = async ({
    authorized = false,
    connectionId,
    privatePath,
    publicLink,
    oauthToken,
}: {
    authorized?: boolean;
    connectionId?: string;
    privatePath?: string;
    publicLink?: string;
    oauthToken?: string;
}): Promise<{document?: AddYandexDocumentResponse; error?: DataLensApiError}> => {
    try {
        const document = await getSdk().sdk.biConverter.addYandexDocument({
            authorized,
            connection_id: connectionId,
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

const getOAuthUrl = async (
    args: GetOAuthUriArgs,
): Promise<GetOAuthUriResponse & {error?: DataLensApiError}> => {
    try {
        return await getSdk().sdk.bi.getOAuthUri(args);
    } catch (error) {
        return {uri: '', error};
    }
};

const getOAuthToken = async (
    args: GetOAuthTokenArgs,
): Promise<Partial<GetOAuthTokenResponse> & {error?: DataLensApiError}> => {
    try {
        return await getSdk().sdk.bi.getOAuthToken(args);
    } catch (error) {
        return {access_token: '', error};
    }
};

const getPresignedUrl = async (): Promise<GetPresignedUrlResponse & {error?: DataLensApiError}> => {
    try {
        return await getSdk().sdk.biConverter.getPresignedUrl();
    } catch (error) {
        return {url: '', fields: {}, error};
    }
};

const uploadFileToS3 = async (
    args: GetPresignedUrlResponse & {file: File},
): Promise<{error?: DataLensApiError}> => {
    const {fields, file, url} = args;

    try {
        const formData = new FormData();
        Object.entries(fields).forEach(([key, value]) => {
            formData.append(key, value);
        });
        formData.append('file', file);
        /*
            Why don't we need axios here?

            DL axios instance has a lot of predefined settings, for example `withCredentials: true` that
            we don't need in this request. Also we don't want to send any headers, except Content-Type,
            but this header is sets automatically by using FormData object in `fetch` body
            (more details https://muffinman.io/blog/uploading-files-using-fetch-multipart-form-data)
        */
        await fetch(url, {method: 'POST', body: formData});

        return {};
    } catch (error) {
        return {error};
    }
};

const downloadPresignedUrl = async (
    args: DownloadPresignedUrlArgs,
): Promise<DownloadPresignedUrlResponse & {error?: DataLensApiError}> => {
    const {filename, key} = args;
    try {
        return await getSdk().sdk.biConverter.downloadPresignedUrl({
            filename,
            key,
        });
    } catch (error) {
        return {file_id: '', filename: '', error};
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
    addYandexDocument,
    getOAuthUrl,
    getOAuthToken,
    getPresignedUrl,
    uploadFileToS3,
    downloadPresignedUrl,
};
