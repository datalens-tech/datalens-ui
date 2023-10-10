import {I18n} from 'i18n';
import {pipe} from 'lodash/fp';
import {batch} from 'react-redux';
import {ConnectionData, ConnectorType} from 'shared';
import type {FormSchema, GetEntryResponse} from 'shared/schema/types';
import {registry} from 'ui/registry';
import {isEntryAlreadyExists} from 'utils/errors/errorByCode';

import logger from '../../../../libs/logger';
import {showToast} from '../../../../store/actions/toaster';
import {DataLensApiError} from '../../../../typings';
import {getWorkbookIdFromPathname} from '../../../../utils';
import history from '../../../../utils/history';
import {FieldKey, InnerFieldKey} from '../../constants';
import {newConnectionSelector} from '../selectors';
import {ConnectionsReduxDispatch, ConnectionsReduxState, GetState} from '../typings';
import {
    getConnectorItemFromFlattenList,
    getDataForParamsChecking,
    getFakeEntry,
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

const i18n = I18n.keyset('connections.form');

export function setPageData({entryId, workbookId}: {entryId?: string | null; workbookId?: string}) {
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
            ({connectionData, error: connectionError} = await api.fetchConnectionData(entryId));
        }

        if (!entry) {
            entry = getFakeEntry(workbookId);
        }

        batch(() => {
            dispatch(setGroupedConnectors({groupedConnectors}));
            dispatch(setFlattenConnectors({flattenConnectors}));
            dispatch(setEntry({entry, error: entryError}));

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
                pipe([setInitialForm, dispatch])({updates: defaults.form});
                pipe([setForm, dispatch])({updates: defaults.form});
            });
        }

        if (Object.keys(defaults.innerForm).length) {
            pipe([setInnerForm, dispatch])({updates: defaults.innerForm});
        }
    };
}

function setFetchedFormData(schema: FormSchema) {
    return (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const {connectionData} = getState().connections;
        const {form: fetchedFormData} = getFetchedFormData(schema, connectionData);
        // technotes [1]
        fetchedFormData[FieldKey.DbType] = connectionData[FieldKey.DbType];

        if (Object.keys(fetchedFormData).length) {
            batch(() => {
                pipe([setInitialForm, dispatch])({updates: fetchedFormData});
                pipe([setForm, dispatch])({updates: fetchedFormData});
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
        const connectorItem = getConnectorItemFromFlattenList(flattenConnectors, type);
        const useBackendSchema = Boolean(connectorItem?.backend_driven_form);
        let schema: FormSchema | undefined;
        let error: DataLensApiError | undefined;

        if (useBackendSchema) {
            dispatch(setSchemaLoading({schemaLoading: true}));
            ({schema, error} = await api.fetchConnectorSchema({
                type,
                mode: isNewConnection ? 'create' : 'edit',
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

export function changeForm(formUpdates: ConnectionsReduxState['form']) {
    return (dispatch: ConnectionsReduxDispatch) => {
        pipe([setForm, dispatch])({updates: formUpdates});
    };
}

export function changeInnerForm(innerFormUpdates: ConnectionsReduxState['innerForm']) {
    return (dispatch: ConnectionsReduxDispatch) => {
        pipe([setInnerForm, dispatch])({updates: innerFormUpdates});
    };
}

export function createConnection(name: string, dirPath?: string) {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
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
            resultForm[FieldKey.WorkbookId] = getWorkbookIdFromPathname();
        }

        pipe([setSubmitLoading, dispatch])({loading: true});
        const {id: connectionId, error: connError} = await api.createConnection(resultForm);
        let templateFolderId: string | undefined;
        let templateError: DataLensApiError | undefined;

        if (innerForm[InnerFieldKey.isAutoCreateDashboard] && schema.templateName && connectionId) {
            ({entryId: templateFolderId, error: templateError} = await api.copyTemplate(
                connectionId,
                schema.templateName,
            ));
        }

        if (connectionId) {
            // technotes [2]
            pipe([resetFormsData, dispatch])();
        }

        batch(() => {
            if (templateFolderId) {
                history.replace(`/navigation/${templateFolderId}`);
            } else if (connectionId) {
                history.replace(`/connections/${connectionId}`);
            }

            if (templateError) {
                pipe([showToast, dispatch])({
                    title: i18n('label_error-on-template-apply'),
                    error: templateError,
                });
            } else if (connError) {
                pipe([showToast, dispatch])({
                    title: isEntryAlreadyExists(connError)
                        ? i18n('label_entry-name-already-exists')
                        : i18n('toast_create-connection-error'),
                    error: connError,
                });
            }

            pipe([setSubmitLoading, dispatch])({loading: false});
        });
    };
}

export function updateConnection() {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const {form, innerForm, schema, connectionData} = getState().connections;

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

        // technotes [1]
        delete resultForm[FieldKey.DbType];

        const validationErrors = getValidationErrors({
            apiSchemaItem: schema.apiSchema.edit,
            form: resultForm,
            innerForm,
        });
        pipe([setValidationErrors, dispatch])({errors: validationErrors});

        if (validationErrors.length) {
            return;
        }

        pipe([setSubmitLoading, dispatch])({loading: true});
        const {error} = await api.updateConnection(resultForm, connectionData.id as string);
        batch(() => {
            if (error) {
                pipe([showToast, dispatch])({title: i18n('toast_modify-connection-error'), error});
            } else {
                pipe([setInitialForm, dispatch])({updates: form});
            }

            pipe([setSubmitLoading, dispatch])({loading: false});
        });
    };
}

export function checkConnection() {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const {entry, schema, form, connectionData} = getState().connections;
        const newConnection = !entry?.entryId;

        if (!schema) {
            logger.logError(
                'Redux actions (conn): checkConnection - there is no schema for checking',
            );
            return;
        }

        const params = getDataForParamsChecking(schema, {
            ...form,
            // technotes [3]
            ...(newConnection && {[FieldKey.Name]: 'mocked_name'}),
        });

        // technotes [1]
        delete params[FieldKey.DbType];

        const connectionId = connectionData.id && (connectionData.id as string);

        pipe([setCheckLoading, dispatch])({loading: true});
        const checkData = await (connectionId
            ? api.checkConnection(params, connectionId)
            : api.checkConnectionParams(params));

        batch(() => {
            pipe([setCheckData, dispatch])({...checkData});

            if (checkData.error) {
                pipe([showToast, dispatch])({
                    title: i18n('toast_verify-error'),
                    error: checkData.error,
                });
            }

            pipe([setCheckLoading, dispatch])({loading: false});
        });
    };
}
