import type {Toaster} from '@gravity-ui/uikit';
import type {DatalensGlobalState} from 'index';
import _debounce from 'lodash/debounce';
import {batch} from 'react-redux';
import type {Dispatch} from 'redux';
import type {ThunkDispatch} from 'redux-thunk';
import type {
    Dataset,
    DatasetAvatarRelation,
    DatasetField,
    DatasetSource,
    DatasetSourceAvatar,
    WorkbookId,
} from 'shared';
import {TIMEOUT_100_SEC, TIMEOUT_65_SEC} from 'shared';
import type {GetPreviewResponse, ValidateDatasetResponse} from 'shared/schema';
import {sdk} from 'ui';
import {BI_ERRORS} from 'ui/constants';
import {addEditHistoryPoint, resetEditHistoryUnit} from 'ui/store/actions/editHistory';
import {EDIT_HISTORY_ACTION} from 'ui/store/constants/editHistory';
import type {EditHistoryUnit} from 'ui/store/reducers/editHistory';
import Utils from 'ui/utils';

import type {ApplyData} from '../../../../../components/DialogFilter/DialogFilter';
import logger from '../../../../../libs/logger';
import {getSdk} from '../../../../../libs/schematic-sdk';
import {getFilteredObject} from '../../../../../utils';
import {
    DATASETS_EDIT_HISTORY_UNIT_ID,
    TAB_DATASET,
    TAB_FILTERS,
    TAB_SOURCES,
    TOASTERS_NAMES,
} from '../../../constants';
import {EDIT_HISTORY_OPTIONS_KEY} from '../../constants';
import {
    datasetContentSelector,
    datasetFieldsSelector,
    datasetIdSelector,
    datasetPreviewSelector,
    datasetValidationSelector,
    isLoadPreviewByDefaultSelector,
    workbookIdSelector,
} from '../../selectors';
import type {
    BaseSource,
    ConnectionEntry,
    DatasetError,
    DatasetReduxAction,
    DatasetReduxState,
    EditHistoryOptions,
    EditorItemToDisplay,
    FreeformSource,
    SetCurrentTab,
    SetLastModifiedTab,
    ToggleAllowanceSave,
    Update,
} from '../../types';
import * as DATASET_ACTION_TYPES from '../types/dataset';

import {updateDatasetByValidation} from './dataset';
import {isContendChanged, prepareUpdates} from './utils';

export type DatasetDispatch = ThunkDispatch<DatalensGlobalState, void, DatasetReduxAction>;
export type GetState = () => DatalensGlobalState;

type ValidateDatasetArgs = {
    compareContent?: boolean;
    initial?: boolean;
};

type DispatchFetchPreviewParams = {
    datasetId: string;
    workbookId: WorkbookId;
    resultSchema: DatasetField[];
    limit: number;
};

type FetchPreviewParams = DispatchFetchPreviewParams & {debounceEnabled?: boolean};

export function setFreeformSources(freeformSources: FreeformSource[]) {
    return (dispatch: Dispatch<DatasetReduxAction>) => {
        dispatch({
            type: DATASET_ACTION_TYPES.SET_FREEFORM_SOURCES,
            payload: {freeformSources},
        });
    };
}

export function resetDatasetState() {
    return (dispatch: Dispatch) => {
        batch(() => {
            dispatch(resetEditHistoryUnit({unitId: DATASETS_EDIT_HISTORY_UNIT_ID}));
            dispatch({type: DATASET_ACTION_TYPES.RESET_DATASET_STATE});
        });
    };
}

export function renameDataset(key: string) {
    return {
        type: DATASET_ACTION_TYPES.RENAME_DATASET,
        payload: key,
    };
}
//
export function toggleSaveDataset(args: ToggleAllowanceSave['payload']): DatasetReduxAction {
    const {enable = true, validationPending, [EDIT_HISTORY_OPTIONS_KEY]: editHistoryOptions} = args;
    return {
        type: DATASET_ACTION_TYPES.TOGGLE_ALLOWANCE_SAVE,
        payload: {
            enable,
            validationPending,
            [EDIT_HISTORY_OPTIONS_KEY]: {
                stacked: true,
                ...editHistoryOptions,
            },
        },
    };
}

export function toggleViewPreview({view}: {view: 'full' | 'bottom' | 'right'}) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.TOGGLE_VIEW_PREVIEW,
            payload: {
                view,
            },
        });
    };
}

export function openPreview() {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.OPEN_PREVIEW,
        });

        dispatch(queuedFetchPreviewDataset());
    };
}
export function closePreview() {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.CLOSE_PREVIEW,
        });
    };
}
export function togglePreview() {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.TOGGLE_PREVIEW,
        });

        dispatch(queuedFetchPreviewDataset());
    };
}

export function queuePreviewToOpen(enable: boolean) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.SET_QUEUE_TO_LOAD_PREVIEW,
            payload: {
                enable,
            },
        });
    };
}

export function clearDatasetPreview() {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.CLEAR_PREVIEW,
            payload: {},
        });
    };
}

const dispatchFetchPreviewDataset = async (
    {datasetId, workbookId, resultSchema, limit}: DispatchFetchPreviewParams,
    dispatch: DatasetDispatch,
    getState: GetState,
) => {
    try {
        dispatch({
            type: DATASET_ACTION_TYPES.PREVIEW_DATASET_FETCH_REQUEST,
            payload: {},
        });
        const state = getState();
        const {isLoading} = datasetValidationSelector(state);
        const content = datasetContentSelector(state) as Dataset['dataset'];

        let previewDataset: GetPreviewResponse = {};

        if (resultSchema.length && !isLoading) {
            previewDataset = await getSdk().sdk.bi.getPreview(
                {
                    datasetId,
                    workbookId,
                    limit,
                    dataset: content,
                    version: 'draft',
                },
                {timeout: TIMEOUT_100_SEC},
            );
        } else {
            return dispatch(clearDatasetPreview());
        }
        const {result: {regular, data} = {}} = previewDataset;

        dispatch({
            type: DATASET_ACTION_TYPES.PREVIEW_DATASET_FETCH_SUCCESS,
            payload: {
                data: data || regular,
                [EDIT_HISTORY_OPTIONS_KEY]: {
                    stacked: true,
                },
            },
        });
    } catch (error) {
        if (!sdk.isCancel(error)) {
            logger.logError('dataset: dispatchFetchPreviewDataset failed', error);
            dispatch({
                type: DATASET_ACTION_TYPES.PREVIEW_DATASET_FETCH_FAILURE,
                payload: {
                    error,
                    [EDIT_HISTORY_OPTIONS_KEY]: {
                        stacked: true,
                    },
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
}: FetchPreviewParams) {
    return (dispatch: DatasetDispatch, getState: GetState) => {
        if (getState().dataset.preview.isVisible) {
            return dispatch(
                debounceEnabled
                    ? debouncedFetchPreviewDataset.bind(null, {
                          datasetId,
                          workbookId,
                          resultSchema,
                          limit,
                      })
                    : dispatchFetchPreviewDataset.bind(null, {
                          datasetId,
                          workbookId,
                          resultSchema,
                          limit,
                      }),
            );
        } else {
            return dispatch(queuePreviewToOpen(true));
        }
    };
}

export function refetchPreviewDataset() {
    return (dispatch: DatasetDispatch, getState: GetState) => {
        const state = getState();
        const resultSchema = datasetFieldsSelector(state);
        const datasetId = datasetIdSelector(state);
        const workbookId = workbookIdSelector(state);
        const {amountPreviewRows} = datasetPreviewSelector(state);

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

// Lazy loading dataset preview
export function queuedFetchPreviewDataset() {
    return (dispatch: DatasetDispatch, getState: GetState) => {
        const preview = datasetPreviewSelector(getState());

        // If no actions were performed while preview were hidden
        // or there is no queued tasks to load
        if (!preview.isQueued || !preview.isVisible) {
            return;
        }

        // If preview is visible and there were any changes performed
        // we are loading new preview data
        if (preview.previewEnabled) {
            dispatch(queuePreviewToOpen(false));
            dispatch(refetchPreviewDataset());
        }
    };
}

export function toggleLoadPreviewByDefault(
    enable: boolean,
    editHistoryOptions?: EditHistoryOptions,
) {
    return (dispatch: DatasetDispatch, getState: GetState) => {
        if (isLoadPreviewByDefaultSelector(getState()) !== enable) {
            dispatch({
                type: DATASET_ACTION_TYPES.TOGGLE_LOAD_PREVIEW_BY_DEFAULT,
                payload: {
                    enable,
                    [EDIT_HISTORY_OPTIONS_KEY]: {
                        ...editHistoryOptions,
                    },
                },
            });

            dispatch(toggleSaveDataset({enable: true}));
        }
    };
}

export function changeAmountPreviewRows({
    amountPreviewRows,
    editHistoryOptions,
}: {
    amountPreviewRows: number;
    editHistoryOptions?: EditHistoryOptions;
}) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.CHANGE_AMOUNT_PREVIEW_ROWS,
            payload: {
                amountPreviewRows,
                [EDIT_HISTORY_OPTIONS_KEY]: {
                    ...editHistoryOptions,
                },
            },
        });
    };
}

export function duplicateField(field: DatasetField, editHistoryOptions?: EditHistoryOptions) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.DUPLICATE_FIELD,
            payload: {
                field,
                [EDIT_HISTORY_OPTIONS_KEY]: {
                    ...editHistoryOptions,
                },
            },
        });
    };
}

export function batchDeleteFields(
    fields: Partial<DatasetField>[],
    editHistoryOptions?: EditHistoryOptions,
) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.BATCH_DELETE_FIELDS,
            payload: {
                fields,
                [EDIT_HISTORY_OPTIONS_KEY]: {
                    ...editHistoryOptions,
                },
            },
        });
    };
}

export function batchUpdateFields(
    fields: Partial<DatasetField>[],
    ignoreMergeWithSchema?: boolean,
    editHistoryOptions?: EditHistoryOptions,
) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.BATCH_UPDATE_FIELDS,
            payload: {
                fields,
                ignoreMergeWithSchema,
                [EDIT_HISTORY_OPTIONS_KEY]: {
                    ...editHistoryOptions,
                },
            },
        });
    };
}

export function updateRLS(rls: {[key: string]: string}, editHistoryOptions?: EditHistoryOptions) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.UPDATE_RLS,
            payload: {
                rls,
                [EDIT_HISTORY_OPTIONS_KEY]: {
                    tab: TAB_DATASET,
                    ...editHistoryOptions,
                },
            },
        });

        dispatch(toggleSaveDataset({enable: true}));
    };
}

export function clickConnection({connectionId}: {connectionId: string}) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.CLICK_CONNECTION,
            payload: {
                connectionId,
            },
        });
    };
}
export function addConnection({
    connection,
    editHistoryOptions,
}: {
    connection: ConnectionEntry;
    editHistoryOptions?: EditHistoryOptions;
}) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.ADD_CONNECTION,
            payload: {
                connection,
                [EDIT_HISTORY_OPTIONS_KEY]: {
                    ...editHistoryOptions,
                },
            },
        });
    };
}
export function deleteConnection({
    connectionId,
    editHistoryOptions,
}: {
    connectionId: string;
    editHistoryOptions?: EditHistoryOptions;
}) {
    return (dispatch: DatasetDispatch, getState: GetState) => {
        dispatch({
            type: DATASET_ACTION_TYPES.DELETE_CONNECTION,
            payload: {
                connectionId,
                [EDIT_HISTORY_OPTIONS_KEY]: {
                    ...editHistoryOptions,
                },
            },
        });

        const {
            dataset: {
                selectedConnections,
                errors: {sourceLoadingError},
            },
        } = getState();

        getSdk().cancelRequest('getSources');

        if (
            (sourceLoadingError && sourceLoadingError.connectionId === connectionId) ||
            !selectedConnections.length
        ) {
            dispatch(setSourcesLoadingError(null));
        }
    };
}

export function addAvatarPrototypes({
    list,
    templates,
}: {
    list: BaseSource[];
    templates: FreeformSource;
}) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.ADD_AVATAR_PROTOTYPES,
            payload: {
                list,
                templates,
            },
        });
    };
}

export function addSource({
    source,
    editHistoryOptions,
}: {
    source: DatasetSource;
    editHistoryOptions?: EditHistoryOptions;
}) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.SOURCE_ADD,
            payload: {
                source,
                [EDIT_HISTORY_OPTIONS_KEY]: {
                    stacked: true,
                    tab: TAB_SOURCES,
                    ...editHistoryOptions,
                },
            },
        });
    };
}
export function updateSource({
    source,
    editHistoryOptions,
}: {
    source: DatasetSource;
    editHistoryOptions?: EditHistoryOptions;
}) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.SOURCE_UPDATE,
            payload: {
                source,
                [EDIT_HISTORY_OPTIONS_KEY]: {
                    stacked: true,
                    tab: TAB_SOURCES,
                    ...editHistoryOptions,
                },
            },
        });
    };
}
export function deleteSource({
    sourceId,
    editHistoryOptions,
}: {
    sourceId: string;
    editHistoryOptions?: EditHistoryOptions;
}) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.SOURCE_DELETE,
            payload: {
                sourceId,
                [EDIT_HISTORY_OPTIONS_KEY]: {
                    tab: TAB_SOURCES,
                    ...editHistoryOptions,
                },
            },
        });
    };
}
export function refreshSources(editHistoryOptions?: EditHistoryOptions) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.SOURCES_REFRESH,
            [EDIT_HISTORY_OPTIONS_KEY]: {
                tab: TAB_DATASET,
                ...editHistoryOptions,
            },
        });
    };
}
export function replaceSource({
    source,
    avatar,
    editHistoryOptions,
}: {
    source: DatasetSource;
    avatar: DatasetSourceAvatar;
    editHistoryOptions?: EditHistoryOptions;
}) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.SOURCE_REPLACE,
            payload: {
                source,
                avatar,
                [EDIT_HISTORY_OPTIONS_KEY]: {
                    tab: TAB_SOURCES,
                    ...editHistoryOptions,
                },
            },
        });
    };
}

export function replaceConnection({
    connection,
    newConnection,
    editHistoryOptions,
}: {
    connection?: ConnectionEntry;
    newConnection?: ConnectionEntry;
    editHistoryOptions?: EditHistoryOptions;
}) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.CONNECTION_REPLACE,
            payload: {
                connection,
                newConnection,
                [EDIT_HISTORY_OPTIONS_KEY]: {
                    tab: TAB_SOURCES,
                    ...editHistoryOptions,
                },
            },
        });
    };
}

export function addAvatar({
    avatar,
    editHistoryOptions,
}: {
    avatar: DatasetSourceAvatar;
    editHistoryOptions?: EditHistoryOptions;
}) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.AVATAR_ADD,
            payload: {
                avatar,
                [EDIT_HISTORY_OPTIONS_KEY]: {
                    stacked: true,
                    tab: TAB_SOURCES,
                    ...editHistoryOptions,
                },
            },
        });
    };
}
export function deleteAvatar({
    avatarId,
    editHistoryOptions,
}: {
    avatarId: string;
    editHistoryOptions?: EditHistoryOptions;
}) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.AVATAR_DELETE,
            payload: {
                avatarId,
                [EDIT_HISTORY_OPTIONS_KEY]: {
                    tab: TAB_SOURCES,
                    ...editHistoryOptions,
                },
            },
        });
    };
}

export function addRelation({
    relation,
    editHistoryOptions,
}: {
    relation: DatasetAvatarRelation;
    editHistoryOptions?: EditHistoryOptions;
}) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.RELATION_ADD,
            payload: {
                relation,
                [EDIT_HISTORY_OPTIONS_KEY]: {
                    tab: TAB_SOURCES,
                    ...editHistoryOptions,
                },
            },
        });
    };
}
export function updateRelation({
    relation,
    editHistoryOptions,
}: {
    relation: DatasetAvatarRelation;
    editHistoryOptions?: EditHistoryOptions;
}) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.RELATION_UPDATE,
            payload: {
                relation,
                [EDIT_HISTORY_OPTIONS_KEY]: {
                    tab: TAB_SOURCES,
                    ...editHistoryOptions,
                },
            },
        });
    };
}
export function deleteRelation({
    relationId,
    editHistoryOptions,
}: {
    relationId: string;
    editHistoryOptions?: EditHistoryOptions;
}) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.RELATION_DELETE,
            payload: {
                relationId,
                [EDIT_HISTORY_OPTIONS_KEY]: {
                    tab: TAB_SOURCES,
                    ...editHistoryOptions,
                },
            },
        });
    };
}

export function addObligatoryFilter(filter: ApplyData, editHistoryOptions?: EditHistoryOptions) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.ADD_OBLIGATORY_FILTER,
            payload: {
                filter,
                [EDIT_HISTORY_OPTIONS_KEY]: {
                    tab: TAB_FILTERS,
                    ...editHistoryOptions,
                },
            },
        });
    };
}
export function updateObligatoryFilter(filter: ApplyData, editHistoryOptions?: EditHistoryOptions) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.UPDATE_OBLIGATORY_FILTER,
            payload: {
                filter,
                [EDIT_HISTORY_OPTIONS_KEY]: {
                    tab: TAB_FILTERS,
                    ...editHistoryOptions,
                },
            },
        });
    };
}
export function deleteObligatoryFilter(filterId: string, editHistoryOptions?: EditHistoryOptions) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.DELETE_OBLIGATORY_FILTER,
            payload: {
                id: filterId,
                [EDIT_HISTORY_OPTIONS_KEY]: {
                    tab: TAB_FILTERS,
                    ...editHistoryOptions,
                },
            },
        });
    };
}

export function toggleFieldEditorModuleLoader(isLoading: boolean) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.TOGGLE_FIELD_EDITOR_MODULE_LOADING,
            payload: {isLoading},
        });
    };
}

export function toggleSourcesLoader(isSourcesLoading: boolean) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.TOGGLE_SOURCES_LOADER,
            payload: {isSourcesLoading},
        });
    };
}
export function setSourcesLoadingError(error: DatasetError) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.SET_SOURCES_LOADING_ERROR,
            payload: {error},
        });
    };
}

export function setDatasetRevisionMismatch() {
    return (dispatch: DatasetDispatch) => {
        dispatch({type: DATASET_ACTION_TYPES.SET_DATASET_REVISION_MISMATCH});
    };
}

export function setValidationData(validation: ValidateDatasetResponse) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.DATASET_VALIDATE_SUCCESS,
            payload: {
                validation,
            },
        });
    };
}

export function clearToasters(toasterInstance?: Toaster) {
    Object.values(TOASTERS_NAMES).forEach((toasterName) => {
        if (toasterInstance) {
            toasterInstance.remove(toasterName);
        }
    });
}

export function editorSetFilter(filter: string) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.EDITOR_SET_FILTER,
            payload: {
                filter,
            },
        });
    };
}

export function editorSetItemsToDisplay(itemsToDisplay: EditorItemToDisplay[]) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.EDITOR_SET_ITEMS_TO_DISPLAY,
            payload: {
                itemsToDisplay,
            },
        });
    };
}

export function addField(
    field: Partial<DatasetField>,
    ignoreMergeWithSchema?: boolean,
    editHistoryOptions?: EditHistoryOptions,
) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.ADD_FIELD,
            payload: {
                field,
                ignoreMergeWithSchema,
                [EDIT_HISTORY_OPTIONS_KEY]: {
                    ...editHistoryOptions,
                },
            },
        });
    };
}

export function addFieldWithValidation(
    field: DatasetField,
    editHistoryOptions?: EditHistoryOptions,
) {
    return (dispatch: DatasetDispatch) => {
        batch(() => {
            dispatch(addField(field, true, editHistoryOptions));
            dispatch(updateDatasetByValidation({updatePreview: true}));
        });
    };
}

function deleteField(field: Partial<DatasetField>, editHistoryOptions?: EditHistoryOptions) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.DELETE_FIELD,
            payload: {
                field,
                [EDIT_HISTORY_OPTIONS_KEY]: {
                    ...editHistoryOptions,
                },
            },
        });
    };
}
export function deleteFieldWithValidation(
    field: DatasetField,
    editHistoryOptions?: EditHistoryOptions,
) {
    return (dispatch: DatasetDispatch) => {
        batch(() => {
            dispatch(deleteField(field, editHistoryOptions));
            dispatch(updateDatasetByValidation({updatePreview: true}));
        });
    };
}

export function duplicateFieldWithValidation(
    field: DatasetField,
    editHistoryOptions?: EditHistoryOptions,
) {
    return (dispatch: DatasetDispatch) => {
        batch(() => {
            dispatch(duplicateField(field, editHistoryOptions));
            dispatch(updateDatasetByValidation({updatePreview: true}));
        });
    };
}

function updateField(
    field: Partial<DatasetField>,
    ignoreMergeWithSchema?: boolean,
    editHistoryOptions?: EditHistoryOptions | null,
) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.UPDATE_FIELD,
            payload: {
                field,
                ignoreMergeWithSchema,
                ...(editHistoryOptions === null
                    ? {}
                    : {
                          [EDIT_HISTORY_OPTIONS_KEY]: {
                              ...editHistoryOptions,
                          },
                      }),
            },
        });
    };
}

export function updateFieldWithValidation(
    field: DatasetField,
    editHistoryOptions?: EditHistoryOptions,
) {
    return (dispatch: DatasetDispatch) => {
        batch(() => {
            dispatch(updateField(field, false, editHistoryOptions));
            dispatch(updateDatasetByValidation({updatePreview: true}));
        });
    };
}

export function updateFieldWithValidationByMultipleUpdates(
    fields: DatasetField[],
    editHistoryOptions?: EditHistoryOptions,
) {
    return (dispatch: DatasetDispatch) => {
        batch(() => {
            fields.forEach((field, index) => {
                dispatch(updateField(field, true, index === 0 ? null : editHistoryOptions));
            });
            dispatch(updateDatasetByValidation({updatePreview: true}));
        });
    };
}

export function validateDataset({compareContent, initial = false}: ValidateDatasetArgs = {}) {
    return async (dispatch: DatasetDispatch, getState: GetState) => {
        let returnUpdates: Update[] | undefined;

        try {
            dispatch({
                type: DATASET_ACTION_TYPES.DATASET_VALIDATE_REQUEST,
                payload: {
                    initial,
                },
            });

            const {
                dataset: {id: datasetId, updates, prevContent},
            } = getState();

            returnUpdates = updates;

            const workbookId = workbookIdSelector(getState());

            const validation = await getSdk().sdk.bi.validateDataset(
                {
                    datasetId,
                    workbookId,
                    version: 'draft',
                    dataset: prevContent,
                    updates: prepareUpdates(updates),
                },
                {timeout: TIMEOUT_65_SEC},
            );

            const {
                dataset: {updates: currentUpdates},
            } = getState();
            const updatesChanged = currentUpdates.length === updates.length;
            const activateSaveButton = compareContent
                ? isContendChanged(prevContent, validation.dataset)
                : true;

            if (!initial && updatesChanged) {
                dispatch(setValidationData(validation));
            }

            if (!initial && activateSaveButton) {
                dispatch(toggleSaveDataset({enable: true}));
            }
        } catch (error) {
            if (!getSdk().sdk.isCancel(error)) {
                const filteredError = getFilteredObject(error, [
                    'details.data.dataset',
                    'details.data.options',
                ]);
                logger.logError('dataset: validateDataset failed', filteredError);

                const {
                    dataset: {prevContent},
                } = getState();
                const content = error.details?.data?.dataset;
                const activateSaveButton = compareContent
                    ? isContendChanged(prevContent, content)
                    : true;
                const isFatalError =
                    Utils.parseErrorResponse(error).code === BI_ERRORS.VALIDATION_FATAL;

                if (!initial && error.status === 400 && activateSaveButton && !isFatalError) {
                    dispatch(toggleSaveDataset({enable: true}));
                } else if (isFatalError) {
                    dispatch(toggleSaveDataset({enable: false}));
                }

                dispatch({
                    type: DATASET_ACTION_TYPES.DATASET_VALIDATE_FAILURE,
                    payload: {
                        error,
                    },
                });
            }
        }

        return returnUpdates;
    };
}

export function setEditHistoryState({
    state,
    type,
}: Parameters<EditHistoryUnit<DatasetReduxState>['setState']>[0]) {
    return (dispatch: DatasetDispatch, getState: GetState) => {
        const {lastModifiedTab: prevLastModifiedTab} = getState().dataset;
        const {lastModifiedTab} = state;
        const resultState = {...state};

        switch (type) {
            case EDIT_HISTORY_ACTION.UNDO: {
                if (prevLastModifiedTab && prevLastModifiedTab !== lastModifiedTab) {
                    resultState.currentTab = prevLastModifiedTab;
                }
                break;
            }
            case EDIT_HISTORY_ACTION.REDO: {
                if (lastModifiedTab && prevLastModifiedTab !== lastModifiedTab) {
                    resultState.currentTab = lastModifiedTab;
                }
            }
        }

        dispatch({
            type: DATASET_ACTION_TYPES.SET_EDIT_HISTORY_STATE,
            payload: {state: resultState},
        });
    };
}

export function addEditHistoryPointDs({stacked, tab}: EditHistoryOptions = {}) {
    return (dispatch: DatasetDispatch, getState: GetState) => {
        batch(() => {
            const {lastModifiedTab} = getState().dataset;

            if (tab && tab !== lastModifiedTab) {
                dispatch(setLastModifiedTab({lastModifiedTab: tab}));
            }

            dispatch(
                addEditHistoryPoint({
                    unitId: DATASETS_EDIT_HISTORY_UNIT_ID,
                    newState: getState().dataset,
                    stacked: stacked,
                }),
            );
        });
    };
}

export function setCurrentTab({currentTab}: SetCurrentTab['payload']): SetCurrentTab {
    return {
        type: DATASET_ACTION_TYPES.SET_CURRENT_TAB,
        payload: {currentTab},
    };
}

export function setLastModifiedTab({
    lastModifiedTab,
}: SetLastModifiedTab['payload']): SetLastModifiedTab {
    return {
        type: DATASET_ACTION_TYPES.SET_LAST_MODIFIED_TAB,
        payload: {lastModifiedTab},
    };
}
