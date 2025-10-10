import {I18n} from 'i18n';
import {flow} from 'lodash';
import {batch} from 'react-redux';
import type {ConnectionData, ConnectorType} from 'shared';
import type {ConnectorItem, FormSchema, GetEntryResponse} from 'shared/schema/types';
import {URL_QUERY} from 'ui';
import {registry} from 'ui/registry';
import {isEntryAlreadyExists} from 'utils/errors/errorByCode';

import logger from '../../../../libs/logger';
import {loadRevisions, setEntryContent} from '../../../../store/actions/entryContent';
import {showToast} from '../../../../store/actions/toaster';
import {RevisionsMode} from '../../../../store/typings/entryContent';
import type {DataLensApiError} from '../../../../typings';
import {getWorkbookIdFromPathname} from '../../../../utils';
import history from '../../../../utils/history';
import {FieldKey, InnerFieldKey} from '../../constants';
import {getIsRevisionsSupported} from '../../utils';
import {connectionIdSelector, newConnectionSelector} from '../selectors';
import type {ConnectionsReduxDispatch, ConnectionsReduxState, GetState} from '../typings';
import {
    getConnectorItemFromFlattenList,
    getDataForParamsChecking,
    getFetchedFormData,
    getFlattenConnectors,
    getFormDefaults,
    getQueryForm,
    getResultFormData,
    getValidationErrors,
} from '../utils';

import {api} from './api';
import {
    resetFormsData,
    setCheckData,
    setCheckLoading,
    setConectorData,
    setEntry,
    setFlattenConnectors,
    setForm,
    setGroupedConnectors,
    setInitialForm,
    setInnerForm,
    setPageLoading,
    setSchema,
    setSchemaLoading,
    setSubmitLoading,
    setValidationErrors,
} from './base';

export * from './api';
export * from './base';
export * from './file';
export * from './gsheet';
export * from './s3-based';
export * from './yadoc';

const i18n = I18n.keyset('connections.form');

function updateRevisions(entry: GetEntryResponse) {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const {entryContent} = getState();
        dispatch(setEntryContent(entry));

        if (entryContent.revisionsMode === RevisionsMode.Opened) {
            await dispatch(
                loadRevisions({
                    entryId: entry?.entryId ?? '',
                    page: 0,
                }),
            );
        }
    };
}

interface GetConnectionDataRequestProps {
    entry?: GetEntryResponse;
    flattenConnectors: ConnectorItem[];
    rev_id?: string;
}
export async function getConnectionDataRequest({
    entry,
    flattenConnectors,
    rev_id,
}: GetConnectionDataRequestProps) {
    let revId: string | undefined;
    let connectionData: ConnectionData | undefined;
    let connectionError: DataLensApiError | undefined;

    if (entry) {
        const isRevisionsSupported = getIsRevisionsSupported({entry, flattenConnectors});
        if (isRevisionsSupported) {
            revId = rev_id;
        }
        ({connectionData, error: connectionError} = await api.fetchConnectionData(
            entry.entryId,
            entry?.workbookId ?? null,
            revId,
        ));
    }
    return {connectionData, connectionError};
}

export function setRevision(revId?: string) {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        dispatch(setPageLoading({pageLoading: true}));
        const {
            connections: {flattenConnectors, entry},
        } = getState();
        const {connectionData, connectionError} = await getConnectionDataRequest({
            entry,
            flattenConnectors,
            rev_id: revId,
        });
        batch(() => {
            dispatch(
                setConectorData({connectionData: connectionData ?? {}, error: connectionError}),
            );
            dispatch(setPageLoading({pageLoading: false}));
        });
    };
}

export function setPageData({
    entryId,
    workbookId,
    rev_id,
}: {
    entryId?: string | null;
    workbookId?: string;
    rev_id?: string;
}) {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        dispatch(setPageLoading({pageLoading: true}));
        const groupedConnectors = await api.fetchConnectors();
        const flattenConnectors = getFlattenConnectors(groupedConnectors);
        const {checkData, form, validationErrors} = getState().connections;
        let entry: GetEntryResponse | undefined;
        let entryError: DataLensApiError | undefined;
        let connectionData: ConnectionData | undefined;
        let connectionError: DataLensApiError | undefined;

        if (entryId) {
            ({entry, error: entryError} = await api.fetchEntry(entryId));
            ({connectionData, connectionError} = await getConnectionDataRequest({
                entry,
                flattenConnectors,
                rev_id,
            }));
        }

        if (!entry) {
            const getFakeEntry = registry.connections.functions.get('getFakeEntry');
            entry = getFakeEntry(workbookId);
        }

        batch(() => {
            dispatch(setGroupedConnectors({groupedConnectors}));
            dispatch(setFlattenConnectors({flattenConnectors}));
            dispatch(
                setEntry({
                    entry: {...entry, revId: rev_id ?? entry?.publishedId ?? ''},
                    error: entryError,
                }),
            );

            if (Object.keys(form).length) {
                dispatch(resetFormsData());
            }

            if (entryId) {
                dispatch(
                    setConectorData({connectionData: connectionData || {}, error: connectionError}),
                );
            }

            if (checkData.status !== 'unknown') {
                dispatch(setCheckData({status: 'unknown'}));
            }

            if (validationErrors.length) {
                dispatch(setValidationErrors({errors: []}));
            }

            dispatch(setPageLoading({pageLoading: false}));
        });
    };
}

export function setFormData(args: {type: ConnectorType; schema: FormSchema}) {
    return (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const {type, schema} = args;
        const {entry} = getState().connections;

        if (entry?.entryId) {
            dispatch(setFetchedFormData(schema));
        } else {
            dispatch(setDefaultFormData({type, schema}));
        }
    };
}

function setDefaultFormData(args: {type: ConnectorType; schema: FormSchema}) {
    return (dispatch: ConnectionsReduxDispatch) => {
        const {type, schema} = args;
        const defaults = getFormDefaults(schema);
        const queryForm = getQueryForm();

        defaults.form = {
            ...defaults.form,
            ...queryForm,
            [FieldKey.Type]: type,
        };

        if (Object.keys(defaults.form).length) {
            batch(() => {
                flow([setInitialForm, dispatch])({updates: defaults.form});
                flow([setForm, dispatch])({updates: defaults.form});
            });
        }

        if (Object.keys(defaults.innerForm).length) {
            flow([setInnerForm, dispatch])({updates: defaults.innerForm});
        }
    };
}

function setFetchedFormData(schema: FormSchema) {
    return (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const {connectionData} = getState().connections;
        const {form: fetchedFormData} = getFetchedFormData(schema, connectionData);
        // TODO: remove after BI-6604
        fetchedFormData[FieldKey.Description] = connectionData[FieldKey.Description];
        // technotes [1]
        fetchedFormData[FieldKey.DbType] = connectionData[FieldKey.DbType];

        if (Object.keys(fetchedFormData).length) {
            batch(() => {
                flow([setInitialForm, dispatch])({updates: fetchedFormData});
                flow([setForm, dispatch])({updates: fetchedFormData});
            });
        }
    };
}

export function getConnectors() {
    return async (dispatch: ConnectionsReduxDispatch) => {
        dispatch(setPageLoading({pageLoading: true}));
        const groupedConnectors = await api.fetchConnectors();
        const flattenConnectors = getFlattenConnectors(groupedConnectors);
        batch(() => {
            dispatch(setGroupedConnectors({groupedConnectors}));
            dispatch(setFlattenConnectors({flattenConnectors}));
            dispatch(setPageLoading({pageLoading: false}));
        });
    };
}

export function getConnectorSchema(type: ConnectorType) {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const {flattenConnectors} = getState().connections;
        const isNewConnection = newConnectionSelector(getState());
        const connectionId = connectionIdSelector(getState());
        const connectorItem = getConnectorItemFromFlattenList(flattenConnectors, type);
        const useBackendSchema = Boolean(connectorItem?.backend_driven_form);
        let schema: FormSchema | undefined;
        let error: DataLensApiError | undefined;

        if (useBackendSchema) {
            dispatch(setSchemaLoading({schemaLoading: true}));
            ({schema, error} = await api.fetchConnectorSchema({
                type,
                mode: isNewConnection ? 'create' : 'edit',
                connectionId: isNewConnection ? undefined : connectionId,
            }));
        } else {
            const getMockedForm = registry.connections.functions.get('getMockedForm');
            schema = getMockedForm({type, isNewConnection});
        }

        batch(() => {
            dispatch(setSchema({schema, error}));

            if (schema) {
                dispatch(setFormData({type, schema}));
            }

            if (useBackendSchema) {
                dispatch(setSchemaLoading({schemaLoading: false}));
            }
        });
    };
}

export function getConnectionData(revId?: string) {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const {entry, flattenConnectors} = getState().connections;

        if (!entry) {
            return;
        }
        dispatch(setPageLoading({pageLoading: true}));

        const {connectionData, connectionError} = await getConnectionDataRequest({
            entry,
            flattenConnectors,
            rev_id: revId,
        });
        batch(() => {
            dispatch(
                setConectorData({connectionData: connectionData ?? {}, error: connectionError}),
            );
            dispatch(setPageLoading({pageLoading: false}));
        });
    };
}

export function changeForm(formUpdates: ConnectionsReduxState['form']) {
    return (dispatch: ConnectionsReduxDispatch) => {
        flow([setForm, dispatch])({updates: formUpdates});
    };
}

export function changeInnerForm(innerFormUpdates: ConnectionsReduxState['innerForm']) {
    return (dispatch: ConnectionsReduxDispatch) => {
        flow([setInnerForm, dispatch])({updates: innerFormUpdates});
    };
}

export function changeInitialForm(initialFormUpdates: ConnectionsReduxState['initialForm']) {
    return (dispatch: ConnectionsReduxDispatch) => {
        flow([setInitialForm, dispatch])({updates: initialFormUpdates});
    };
}

export function createConnection(args: {name: string; dirPath?: string; workbookId?: string}) {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const {name, dirPath, workbookId = getWorkbookIdFromPathname()} = args;
        const {form, innerForm, schema} = getState().connections;

        if (!schema || !schema.apiSchema?.create) {
            logger.logError(
                'Redux actions (conn): createConnection - there is no connection schema',
            );

            return;
        }

        const resultForm = getResultFormData({
            form,
            innerForm,
            apiSchemaItem: schema.apiSchema?.create,
        });

        resultForm[FieldKey.Name] = name;

        if (typeof dirPath === 'string') {
            resultForm[FieldKey.DirPath] = dirPath;
        } else {
            resultForm[FieldKey.WorkbookId] = workbookId;
        }

        // TODO: remove after BI-6604
        resultForm[FieldKey.Description] = form[FieldKey.Description];

        flow([setSubmitLoading, dispatch])({loading: true});
        const {id: connectionId, error: connError} = await api.createConnection(resultForm);
        let templateFolderId: string | undefined;
        let templateWorkbookId: string | undefined;
        let templateError: DataLensApiError | undefined;

        if (innerForm[InnerFieldKey.isAutoCreateDashboard] && schema.templateName && connectionId) {
            const getConnectionsWithForceSkippedCopyTemplateInWorkbooks =
                registry.connections.functions.get(
                    'getConnectionsWithForceSkippedCopyTemplateInWorkbooks',
                );

            const connectionsWithForceSkippedCopyTemplateInWorkbooks =
                getConnectionsWithForceSkippedCopyTemplateInWorkbooks() ?? [];

            const forceSkipCopyTemplate = Boolean(
                connectionsWithForceSkippedCopyTemplateInWorkbooks.includes(schema.templateName) &&
                    workbookId,
            );

            if (forceSkipCopyTemplate === false) {
                ({
                    entryId: templateFolderId,
                    workbookId: templateWorkbookId,
                    error: templateError,
                } = await api.copyTemplate(
                    connectionId,
                    schema.templateName,
                    workbookId === '' ? undefined : workbookId,
                ));
            }
        }

        if (connectionId) {
            // technotes [2]
            flow([resetFormsData, dispatch])();
        }

        if (templateFolderId) {
            history.replace(`/navigation/${templateFolderId}`);
        } else if (templateWorkbookId) {
            history.replace(`/workbooks/${templateWorkbookId}`);
        } else if (connectionId) {
            history.replace(`/connections/${connectionId}`);
        }

        batch(() => {
            if (templateError) {
                flow([showToast, dispatch])({
                    title: i18n('label_error-on-template-apply'),
                    error: templateError,
                });
            } else if (connError) {
                flow([showToast, dispatch])({
                    title: isEntryAlreadyExists(connError)
                        ? i18n('label_entry-name-already-exists')
                        : i18n('toast_create-connection-error'),
                    error: connError,
                });
            }

            flow([setSubmitLoading, dispatch])({loading: false});
        });
    };
}

export function _updateConnection() {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const {form, innerForm, schema, connectionData, entry} = getState().connections;

        if (!schema || !schema.apiSchema?.edit) {
            logger.logError(
                'Redux actions (conn): updateConnection - there is no schema for validated',
            );

            return;
        }

        const resultForm = getResultFormData({
            form,
            innerForm,
            apiSchemaItem: schema.apiSchema?.edit,
        });
        // TODO: remove after BI-6604
        resultForm[FieldKey.Description] = form[FieldKey.Description];

        // technotes [1]
        delete resultForm[FieldKey.DbType];

        const validationErrors = getValidationErrors({
            apiSchemaItem: schema.apiSchema.edit,
            form: resultForm,
            innerForm,
        });
        flow([setValidationErrors, dispatch])({errors: validationErrors});

        if (validationErrors.length) {
            return;
        }

        flow([setSubmitLoading, dispatch])({loading: true});
        const {error} = await api.updateConnection(
            resultForm,
            connectionData.id as string,
            connectionData.db_type as string,
        );
        let updatedEntry: GetEntryResponse | undefined;
        if (!error && entry?.entryId) {
            const response = await api.fetchEntry(entry.entryId);
            updatedEntry = response.entry;
        }
        batch(() => {
            if (error) {
                flow([showToast, dispatch])({title: i18n('toast_modify-connection-error'), error});
            } else {
                flow([setInitialForm, dispatch])({updates: form});
                if (updatedEntry) {
                    flow([updateRevisions, dispatch])(updatedEntry);
                }
            }

            flow([setSubmitLoading, dispatch])({loading: false});
        });
    };
}

export function updateConnection() {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const {
            connections: {flattenConnectors, entry},
        } = getState();
        const isRevisionsSupported = getIsRevisionsSupported({entry, flattenConnectors});
        const searchParams = new URLSearchParams(location.search);
        searchParams.delete(URL_QUERY.REV_ID);
        await dispatch(_updateConnection());

        if (isRevisionsSupported) {
            history.push({
                ...location,
                search: `?${searchParams.toString()}`,
            });
        }
    };
}

export function checkConnection() {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const {entry, schema, form, innerForm, connectionData} = getState().connections;
        const newConnection = !entry?.entryId;

        if (!schema) {
            logger.logError(
                'Redux actions (conn): checkConnection - there is no schema for checking',
            );
            return;
        }

        const params = getDataForParamsChecking({
            form: {
                ...form,
                // technotes [3]
                ...(newConnection && {[FieldKey.Name]: 'mocked_name'}),
            },
            innerForm,
            schema,
        });

        // technotes [1]
        delete params[FieldKey.DbType];

        const connectionId = connectionData.id && (connectionData.id as string);

        flow([setCheckLoading, dispatch])({loading: true});
        const checkData = await (connectionId
            ? api.checkConnection(params, connectionId, entry?.workbookId ?? null)
            : api.checkConnectionParams(params));

        batch(() => {
            flow([setCheckData, dispatch])({...checkData});

            if (checkData.error) {
                flow([showToast, dispatch])({
                    title: i18n('toast_verify-error'),
                    error: checkData.error,
                });
            }

            flow([setCheckLoading, dispatch])({loading: false});
        });
    };
}
