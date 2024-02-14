import {Toaster} from '@gravity-ui/uikit';
import type {DatalensGlobalState} from 'index';
import {batch} from 'react-redux';
import type {Dispatch} from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import type {DatasetAvatarRelation, DatasetField, DatasetSource, DatasetSourceAvatar} from 'shared';
import {TIMEOUT_65_SEC} from 'shared';
import type {ValidateDatasetResponse} from 'shared/schema';

import type {ApplyData} from '../../../../../components/DialogFilter/DialogFilter';
import logger from '../../../../../libs/logger';
import {getSdk} from '../../../../../libs/schematic-sdk';
import {TOASTERS_NAMES} from '../../../../../units/datasets/constants';
import {getFilteredObject} from '../../../../../utils';
import {workbookIdSelector} from '../../selectors';
import type {
    BaseSource,
    ConnectionEntry,
    DatasetError,
    DatasetReduxAction,
    EditorItemToDisplay,
    FreeformSource,
    Update,
} from '../../types';
import * as DATASET_ACTION_TYPES from '../types/dataset';

import {updateDatasetByValidation} from './dataset';
import {isContendChanged, prepareUpdates} from './utils';

export type DatasetDispatch = ThunkDispatch<DatalensGlobalState, void, DatasetReduxAction>;

type GetState = () => DatalensGlobalState;
type ValidateDatasetArgs = {
    compareContent?: boolean;
    initial?: boolean;
};

export function setFreeformSources(freeformSources: FreeformSource[]) {
    return (dispatch: Dispatch<DatasetReduxAction>) => {
        dispatch({
            type: DATASET_ACTION_TYPES.SET_FREEFORM_SOURCES,
            payload: {freeformSources},
        });
    };
}

export function resetDatasetState() {
    return {
        type: DATASET_ACTION_TYPES.RESET_DATASET_STATE,
    };
}

export function enableSaveDataset(): DatasetReduxAction {
    return {
        type: DATASET_ACTION_TYPES.TOGGLE_ALLOWANCE_SAVE,
        payload: {
            enable: true,
        },
    };
}
export function disableSaveDataset() {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.TOGGLE_ALLOWANCE_SAVE,
            payload: {
                enable: false,
            },
        });
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
export function updateRLS(rls: {[key: string]: string}) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.UPDATE_RLS,
            payload: {
                rls,
            },
        });

        dispatch(enableSaveDataset());
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
                dispatch(enableSaveDataset());
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

                if (!initial && error.status === 400 && activateSaveButton) {
                    dispatch(enableSaveDataset());
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
