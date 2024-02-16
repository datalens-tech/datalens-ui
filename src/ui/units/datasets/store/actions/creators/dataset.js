import {Toaster} from '@gravity-ui/uikit';
import {i18n} from 'i18n';
import _debounce from 'lodash/debounce';
import {TIMEOUT_65_SEC} from 'shared';
import {sdk} from 'ui';

import logger from '../../../../../libs/logger';
import {getSdk} from '../../../../../libs/schematic-sdk';
import {getDatetimeName} from '../../../../../utils/helpers';
import {ComponentErrorType, SUBSELECT_SOURCE_TYPES} from '../../../constants';
import {getToastTitle} from '../../../helpers/dataset-error-helpers';
import {getComponentErrorsByType} from '../../../helpers/datasets';
import DatasetUtils from '../../../helpers/utils';
import {workbookIdSelector} from '../../selectors';
import * as DATASET_ACTION_TYPES from '../types/dataset';

import {
    addAvatarPrototypes,
    clearToasters,
    disableSaveDataset,
    setFreeformSources,
    setSourcesLoadingError,
    setValidationData,
    toggleSourcesLoader,
    validateDataset,
} from './datasetTyped';

const toaster = new Toaster();

function checkFetchingPreview({updatePreview, updates}) {
    return (
        !updatePreview &&
        updates &&
        updates.length &&
        !updates.every((update) => {
            const {field: {description, title} = {}} = update;

            if (description || title) {
                return true;
            }

            return false;
        })
    );
}

/**
 * @param {Object} args
 * @param {string|undefined} [args.actionTypeNotification]
 * @param {boolean|undefined} [args.updatePreview]
 * @param {boolean|undefined} [args.validateEnabled]
 * @returns {ThunkAction}
 **/
export function updateDatasetByValidation({
    actionTypeNotification,
    compareContent = false,
    updatePreview = false,
    validateEnabled = true,
} = {}) {
    return async (dispatch, getState) => {
        let fetchingPreviewEnabled, updates;

        clearToasters(toaster);

        if (validateEnabled) {
            updates = await dispatch(validateDataset({compareContent}));
            fetchingPreviewEnabled = checkFetchingPreview({updatePreview, updates});
        }

        const {
            dataset: {
                id: datasetId,
                content: {result_schema: resultSchema, component_errors: componentErrors},
                preview: {previewEnabled, amountPreviewRows} = {},
            } = {},
        } = getState();

        const sourceErrors = getComponentErrorsByType(
            componentErrors,
            ComponentErrorType.DataSource,
        );
        const fieldErrors = getComponentErrorsByType(componentErrors, ComponentErrorType.Field);

        if (previewEnabled && (fetchingPreviewEnabled || updatePreview)) {
            if (fieldErrors.length) {
                dispatch(clearDatasetPreview());
            } else {
                const workbookId = workbookIdSelector(getState());

                dispatch(
                    fetchPreviewDataset({
                        datasetId,
                        workbookId,
                        resultSchema,
                        limit: amountPreviewRows,
                    }),
                );
            }
        }

        if (actionTypeNotification) {
            toaster.add({
                name: 'success_update_dataset',
                title: getToastTitle('NOTIFICATION_SUCCESS', actionTypeNotification),
                type: 'success',
            });
        }

        return Promise.resolve({
            updates,
            sourceErrors,
        });
    };
}

export function refetchPreviewDataset() {
    return (dispatch, getState) => {
        const {
            dataset: {
                id: datasetId,
                content: {result_schema: resultSchema},
                preview: {amountPreviewRows} = {},
            } = {},
        } = getState();

        const workbookId = workbookIdSelector(getState());

        dispatch(
            fetchPreviewDataset({
                datasetId,
                workbookId,
                resultSchema,
                limit: amountPreviewRows,
            }),
        );
    };
}

function setInitialSources(ids) {
    return async (dispatch) => {
        try {
            let initialConnections = [];

            if (ids.length) {
                const result = await Promise.allSettled(
                    ids.map((id) =>
                        getSdk().us.getEntry({
                            entryId: id,
                            includePermissionsInfo: true,
                        }),
                    ),
                );
                const entries = result
                    .filter(({status}) => status === 'fulfilled')
                    .map(({value}) => value);

                initialConnections = ids.map((id) => {
                    const connectionEntry = entries.find((entry) => entry.entryId === id);

                    if (connectionEntry) {
                        return connectionEntry;
                    }

                    return {
                        entryId: id,
                        key: i18n('dataset.sources-tab.modify', 'label_deleted-connection'),
                        deleted: true,
                        data: {},
                        // TODO[1]: Uncomment when there will be an icon [YCDESIGN-719]
                        // type: 'deleted'
                    };
                });

                dispatch({
                    type: DATASET_ACTION_TYPES.SET_INITIAL_SOURCES,
                    payload: {
                        selectedConnections: initialConnections,
                        selectedConnection: initialConnections[0],
                    },
                });
            }
        } catch (e) {
            logger.logError('dataset: setInitialSources failed', e);
            console.error(`setInitialSources action failed: ${e}`);
        }
    };
}

export function initializeDataset({connectionId}) {
    return async (dispatch) => {
        if (connectionId) {
            await dispatch(setInitialSources([connectionId]));
        }

        dispatch(_getSources());

        dispatch({
            type: DATASET_ACTION_TYPES.INITIALIZE_DATASET,
            payload: {},
        });
    };
}

export function initialFetchDataset({datasetId}) {
    return async (dispatch, getState) => {
        try {
            dispatch({
                type: DATASET_ACTION_TYPES.DATASET_INITIAL_FETCH_REQUEST,
                payload: {},
            });

            const meta = await getSdk().us.getEntryMeta({entryId: datasetId});
            const workbookId = meta.workbookId ?? null;

            const dataset = await getSdk().bi.getDatasetByVersion({
                datasetId,
                workbookId,
                version: 'draft',
            });
            const {
                dataset: {sources = []},
                options: {
                    preview: {enabled: previewEnabled},
                },
            } = dataset;

            const connectionsIds = new Set(
                sources
                    .filter(DatasetUtils.filterVirtual)
                    .map(({connection_id: connectionId}) => connectionId),
            );
            const ids = Array.from(connectionsIds);

            await dispatch(setInitialSources(ids));

            dispatch({
                type: DATASET_ACTION_TYPES.DATASET_INITIAL_FETCH_SUCCESS,
                payload: {
                    dataset,
                },
            });

            dispatch(_getSources());

            dispatch(validateDataset({initial: true}));

            const {
                dataset: {
                    content: {result_schema: resultSchema},
                    preview: {amountPreviewRows} = {},
                } = {},
            } = getState();

            if (previewEnabled) {
                dispatch(
                    fetchPreviewDataset({
                        datasetId,
                        workbookId,
                        resultSchema,
                        limit: amountPreviewRows,
                    }),
                );
            }
        } catch (error) {
            logger.logError('dataset: initialFetchDataset failed', error);
            dispatch({
                type: DATASET_ACTION_TYPES.DATASET_INITIAL_FETCH_FAILURE,
                payload: {
                    error,
                },
            });
        }
    };
}

export function fetchDataset({datasetId}) {
    return async (dispatch, getState) => {
        try {
            dispatch({
                type: DATASET_ACTION_TYPES.DATASET_FETCH_REQUEST,
                payload: {},
            });

            const workbookId = workbookIdSelector(getState());

            const dataset = await getSdk().bi.getDatasetByVersion({
                datasetId,
                workbookId,
                version: 'draft',
            });

            dispatch({
                type: DATASET_ACTION_TYPES.DATASET_FETCH_SUCCESS,
                payload: {
                    dataset,
                },
            });
        } catch (error) {
            logger.logError('dataset: fetchDataset failed', error);
            dispatch({
                type: DATASET_ACTION_TYPES.DATASET_FETCH_FAILURE,
                payload: {
                    error,
                },
            });
        }
    };
}

function clearDatasetPreview() {
    return (dispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.CLEAR_PREVIEW,
            payload: {},
        });
    };
}

const dispatchFetchPreviewDataset = async (
    {datasetId, workbookId, resultSchema, limit},
    dispatch,
    getState,
) => {
    try {
        dispatch({
            type: DATASET_ACTION_TYPES.PREVIEW_DATASET_FETCH_REQUEST,
            payload: {},
        });
        const {
            dataset: {
                content,
                validation: {isLoading},
            },
        } = getState();
        let previewDataset = {};

        if (resultSchema.length && !isLoading) {
            previewDataset = await getSdk().bi.getPreview({
                datasetId,
                workbookId,
                limit,
                dataset: content,
                version: 'draft',
            });
        } else {
            return dispatch(clearDatasetPreview());
        }

        const {result: {regular, data} = {}} = previewDataset;

        dispatch({
            type: DATASET_ACTION_TYPES.PREVIEW_DATASET_FETCH_SUCCESS,
            payload: {
                data: data || regular,
            },
        });
    } catch (error) {
        if (!sdk.isCancel(error)) {
            logger.logError('dataset: dispatchFetchPreviewDataset failed', error);
            dispatch({
                type: DATASET_ACTION_TYPES.PREVIEW_DATASET_FETCH_FAILURE,
                payload: {
                    error,
                },
            });
        }
    }
};

const debouncedFetchPreviewDataset = _debounce(dispatchFetchPreviewDataset, 3000);

export function fetchPreviewDataset({
    datasetId,
    workbookId,
    resultSchema,
    limit = 100,
    debounceEnabled = false,
}) {
    return debounceEnabled
        ? debouncedFetchPreviewDataset.bind(this, {
              datasetId,
              workbookId,
              resultSchema,
              limit,
          })
        : dispatchFetchPreviewDataset.bind(this, {
              datasetId,
              workbookId,
              resultSchema,
              limit,
          });
}

// There is no key field in the workbooks when creating
export function saveDataset({key, workbookId, name, history, isCreationProcess, isAuto = false}) {
    return async (dispatch, getState) => {
        try {
            dispatch({
                type: DATASET_ACTION_TYPES.DATASET_SAVE_REQUEST,
                payload: {},
            });

            const {dataset: {id, content: dataset} = {}} = getState();
            let datasetId = id;

            if (isCreationProcess) {
                const creationData = {
                    dataset,
                    multisource: true,
                    ...(isAuto && {created_via: 'yt_to_dl'}),
                };

                if (workbookId) {
                    creationData.workbook_id = workbookId;
                    creationData.name = name;
                } else {
                    const dividedKey = DatasetUtils.divideKey(key);
                    const nameFromKey = dividedKey.pop();
                    creationData.dir_path = `${dividedKey.join('/')}/`;
                    creationData.name = nameFromKey;
                }

                const {id: createdDatasetId} = await getSdk().bi.createDataset(creationData);

                datasetId = createdDatasetId;
            } else {
                const validation = await getSdk().bi.updateDataset({
                    datasetId,
                    dataset,
                    multisource: true,
                    version: 'draft',
                });

                dispatch(setValidationData(validation));
            }

            dispatch({
                type: DATASET_ACTION_TYPES.DATASET_SAVE_SUCCESS,
                payload: {},
            });

            if (!isAuto) {
                toaster.add({
                    name: 'success_save_dataset',
                    title: getToastTitle('NOTIFICATION_SUCCESS', 'save'),
                    type: 'success',
                });
            }

            dispatch(disableSaveDataset());

            if (isAuto) {
                history.replace(`/datasets/${datasetId}`);
                DatasetUtils.openCreationWidgetPage({datasetId, target: '_self'});
            } else if (isCreationProcess) {
                history.push(`/datasets/${datasetId}`);
            }
        } catch (error) {
            logger.logError('dataset: saveDataset failed', error);
            dispatch({
                type: DATASET_ACTION_TYPES.DATASET_SAVE_FAILURE,
                payload: {
                    error,
                },
            });
        }
    };
}

export function fetchFieldTypes() {
    return async (dispatch) => {
        let types;

        try {
            const response = await getSdk().bi.getFieldTypes();

            types = response.types
                .map((type) => {
                    const {name, aggregations} = type;

                    return {
                        ...type,
                        title: i18n(
                            'component.field-editor.view',
                            `value_${getDatetimeName(name)}`,
                        ),
                        aggregations: aggregations.sort((current, next) => {
                            if (next === 'none') {
                                return 1;
                            } else {
                                return DatasetUtils.sortStrings(current, next);
                            }
                        }),
                    };
                })
                .sort(DatasetUtils.sortObjectBy('title'));

            dispatch({
                type: DATASET_ACTION_TYPES.FIELD_TYPES_FETCH_SUCCESS,
                payload: {
                    types,
                },
            });

            return types;
        } catch (error) {
            logger.logError('dataset: fetchFieldTypes failed', error);
        }

        toaster.add({
            name: 'error_fetch_types',
            title: getToastTitle('NOTIFICATION_FAILURE', 'types'),
            type: 'error',
        });

        return types;
    };
}

function _getSources() {
    return (dispatch, getState) => {
        const {
            dataset: {
                selectedConnections,
                ui: {selectedConnectionId},
            },
        } = getState();

        const workbookId = workbookIdSelector(getState());

        const selectedConnection = selectedConnections.find(
            ({entryId}) => entryId === selectedConnectionId,
        );

        if (selectedConnection && !selectedConnection.deleted) {
            const {entryId} = selectedConnection;
            dispatch(getSources(entryId, workbookId));
        }
    };
}

export function getSources(connectionId, workbookId) {
    return async (dispatch) => {
        dispatch(toggleSourcesLoader(true));

        let sources = [];

        try {
            const result = await getSdk().bi.getSources(
                {connectionId, workbookId, limit: 10000},
                {concurrentId: 'getSources', timeout: TIMEOUT_65_SEC},
            );
            const freeformSources = result.freeform_sources;
            sources = result.sources;

            const templates = freeformSources.length ? freeformSources[0] : null;
            // TODO[2]: tear off the filter after - BI-1603
            const list = sources.filter(
                ({source_type: sourceType}) => !SUBSELECT_SOURCE_TYPES.includes(sourceType),
            );

            dispatch(
                addAvatarPrototypes({
                    templates,
                    list,
                }),
            );
            dispatch(setFreeformSources(freeformSources));
            dispatch(setSourcesLoadingError(null));
        } catch (error) {
            if (!getSdk().isCancel(error)) {
                logger.logError('dataset: getSources failed', error);
                error.connectionId = connectionId;
                dispatch(setSourcesLoadingError(error));
            }
        } finally {
            dispatch(toggleSourcesLoader(false));
        }

        return sources;
    };
}
