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
import Utils from 'ui/utils';

import type {ApplyData} from '../../../../../components/DialogFilter/DialogFilter';
import logger from '../../../../../libs/logger';
import {getSdk} from '../../../../../libs/schematic-sdk';
import {getFilteredObject} from '../../../../../utils';
import {DATASETS_EDIT_HISTORY_UNIT_ID, TOASTERS_NAMES} from '../../../constants';
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
    EditorItemToDisplay,
    FreeformSource,
    SetEditHistoryState,
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

export function toggleSaveDataset(args: ToggleAllowanceSave['payload']): DatasetReduxAction {
    const {enable = true, validationPending} = args;
    return {
        type: DATASET_ACTION_TYPES.TOGGLE_ALLOWANCE_SAVE,
        payload: {enable, validationPending},
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
            previewDataset = await getSdk().bi.getPreview(
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

export function toggleLoadPreviewByDefault(enable: boolean) {
    return (dispatch: DatasetDispatch, getState: GetState) => {
        if (isLoadPreviewByDefaultSelector(getState()) !== enable) {
            dispatch({
                type: DATASET_ACTION_TYPES.TOGGLE_LOAD_PREVIEW_BY_DEFAULT,
                payload: {enable},
            });

            dispatch(toggleSaveDataset({enable: true}));
        }
    };
}

export function changeAmountPreviewRows({amountPreviewRows}: {amountPreviewRows: number}) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.CHANGE_AMOUNT_PREVIEW_ROWS,
            payload: {
                amountPreviewRows,
            },
        });
    };
}

export function duplicateField(field: DatasetField) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.DUPLICATE_FIELD,
            payload: {
                field,
            },
        });
    };
}
export function deleteField(field: Partial<DatasetField>) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.DELETE_FIELD,
            payload: {
                field,
            },
        });
    };
}
export function batchDeleteFields(fields: Partial<DatasetField>[]) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.BATCH_DELETE_FIELDS,
            payload: {
                fields,
            },
        });
    };
}
export function addField(field: Partial<DatasetField>, ignoreMergeWithSchema?: boolean) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.ADD_FIELD,
            payload: {
                field,
                ignoreMergeWithSchema,
            },
        });
    };
}
export function updateField(field: Partial<DatasetField>, ignoreMergeWithSchema?: boolean) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.UPDATE_FIELD,
            payload: {
                field,
                ignoreMergeWithSchema,
            },
        });
    };
}
export function batchUpdateFields(
    fields: Partial<DatasetField>[],
    ignoreMergeWithSchema?: boolean,
) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.BATCH_UPDATE_FIELDS,
            payload: {
                fields,
                ignoreMergeWithSchema,
            },
        });
    };
}

export function updateRLS(rls: {[key: string]: string}) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.UPDATE_RLS,
            payload: {
                rls,
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
export function addConnection({connection}: {connection: ConnectionEntry}) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.ADD_CONNECTION,
            payload: {
                connection,
            },
        });
    };
}
export function deleteConnection({connectionId}: {connectionId: string}) {
    return (dispatch: DatasetDispatch, getState: GetState) => {
        dispatch({
            type: DATASET_ACTION_TYPES.DELETE_CONNECTION,
            payload: {
                connectionId,
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

export function addSource({source}: {source: DatasetSource}) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.SOURCE_ADD,
            payload: {
                source,
            },
        });
    };
}
export function updateSource({source}: {source: DatasetSource}) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.SOURCE_UPDATE,
            payload: {
                source,
            },
        });
    };
}
export function deleteSource({sourceId}: {sourceId: string}) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.SOURCE_DELETE,
            payload: {
                sourceId,
            },
        });
    };
}
export function refreshSources() {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.SOURCES_REFRESH,
        });
    };
}
export function replaceSource({
    source,
    avatar,
}: {
    source: DatasetSource;
    avatar: DatasetSourceAvatar;
}) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.SOURCE_REPLACE,
            payload: {
                source,
                avatar,
            },
        });
    };
}

export function replaceConnection({
    connection,
    newConnection,
}: {
    connection?: ConnectionEntry;
    newConnection?: ConnectionEntry;
}) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.CONNECTION_REPLACE,
            payload: {
                connection,
                newConnection,
            },
        });
    };
}

export function addAvatar({avatar}: {avatar: DatasetSourceAvatar}) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.AVATAR_ADD,
            payload: {
                avatar,
            },
        });
    };
}
export function deleteAvatar({avatarId}: {avatarId: string}) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.AVATAR_DELETE,
            payload: {
                avatarId,
            },
        });
    };
}

export function addRelation({relation}: {relation: DatasetAvatarRelation}) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.RELATION_ADD,
            payload: {
                relation,
            },
        });
    };
}
export function updateRelation({relation}: {relation: DatasetAvatarRelation}) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.RELATION_UPDATE,
            payload: {
                relation,
            },
        });
    };
}
export function deleteRelation({relationId}: {relationId: string}) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.RELATION_DELETE,
            payload: {
                relationId,
            },
        });
    };
}

export function addObligatoryFilter(filter: ApplyData) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.ADD_OBLIGATORY_FILTER,
            payload: {filter},
        });
    };
}
export function updateObligatoryFilter(filter: ApplyData) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.UPDATE_OBLIGATORY_FILTER,
            payload: {filter},
        });
    };
}
export function deleteObligatoryFilter(filterId: string) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.DELETE_OBLIGATORY_FILTER,
            payload: {id: filterId},
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

export function setAsideHeaderWidth(width: number) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.SET_ASIDE_HEADER_WIDTH,
            payload: {width},
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

export function addFieldWithValidation(field: DatasetField) {
    return (dispatch: DatasetDispatch) => {
        batch(() => {
            dispatch(addField(field, true));
            dispatch(updateDatasetByValidation({updatePreview: true}));
        });
    };
}

export function deleteFieldWithValidation(field: DatasetField) {
    return (dispatch: DatasetDispatch) => {
        batch(() => {
            dispatch(deleteField(field));
            dispatch(updateDatasetByValidation({updatePreview: true}));
        });
    };
}

export function duplicateFieldWithValidation(field: DatasetField) {
    return (dispatch: DatasetDispatch) => {
        batch(() => {
            dispatch(duplicateField(field));
            dispatch(updateDatasetByValidation({updatePreview: true}));
        });
    };
}

export function updateFieldWithValidation(field: DatasetField) {
    return (dispatch: DatasetDispatch) => {
        batch(() => {
            dispatch(updateField(field));
            dispatch(updateDatasetByValidation({updatePreview: true}));
        });
    };
}

export function updateFieldWithValidationByMultipleUpdates(fields: DatasetField[]) {
    return (dispatch: DatasetDispatch) => {
        batch(() => {
            fields.forEach((field) => {
                dispatch(updateField(field, true));
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

            const validation = await getSdk().bi.validateDataset(
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
            if (!getSdk().isCancel(error)) {
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

export function setEditHistoryState(payload: SetEditHistoryState['payload']): SetEditHistoryState {
    return {
        type: DATASET_ACTION_TYPES.SET_EDIT_HISTORY_STATE,
        payload,
    };
}

export type AddEditHistoryPointDsArgs = {
    stacked?: boolean;
};

export function addEditHistoryPointDs({stacked}: AddEditHistoryPointDsArgs = {}) {
    return (dispatch: DatasetDispatch, getState: GetState) => {
        dispatch(
            addEditHistoryPoint({
                unitId: DATASETS_EDIT_HISTORY_UNIT_ID,
                newState: getState().dataset,
                stacked,
            }),
        );
    };
}
