import type {Toaster} from '@gravity-ui/uikit';
import {toaster} from '@gravity-ui/uikit/toaster-singleton';
import type {History} from 'history';
import {i18n} from 'i18n';
import type {DatalensGlobalState} from 'index';
import {URL_QUERY} from 'index';
import _debounce from 'lodash/debounce';
import get from 'lodash/get';
import {batch} from 'react-redux';
import type {Dispatch} from 'redux';
import type {
    CollectionId,
    Dataset,
    DatasetAvatarRelation,
    DatasetField,
    DatasetSource,
    DatasetSourceAvatar,
    SourceListingOptions,
    WorkbookId,
} from 'shared';
import {Feature, TIMEOUT_100_SEC, TIMEOUT_65_SEC} from 'shared';
import type {
    BaseSource,
    CreateCollectionDatasetArgs,
    CreateDatasetArgs,
    CreateDirDatasetArgs,
    CreateWorkbookDatasetArgs,
    GetEntryResponse,
    GetPreviewResponse,
    GetSourceResponse,
    ValidateDatasetResponse,
} from 'shared/schema';
import {sdk} from 'ui';
import {BI_ERRORS} from 'ui/constants';
import type {AppDispatch} from 'ui/store';
import {closeDialog, openDialog} from 'ui/store/actions/dialog';
import {addEditHistoryPoint, resetEditHistoryUnit} from 'ui/store/actions/editHistory';
import {loadRevisions, setEntryContent} from 'ui/store/actions/entryContent';
import {EDIT_HISTORY_ACTION} from 'ui/store/constants/editHistory';
import type {EditHistoryUnit} from 'ui/store/reducers/editHistory';
import type {EntryGlobalState} from 'ui/store/typings/entryContent';
import {RevisionsMode} from 'ui/store/typings/entryContent';
import Utils, {getFilteredObject} from 'ui/utils';

import type {ApplyData} from '../../../../../components/DialogFilter/DialogFilter';
import {DIALOG_SHARED_ENTRY_PERMISSIONS} from '../../../../../components/DialogSharedEntryPermissions/DialogSharedEntryPermissions';
import logger from '../../../../../libs/logger';
import {getSdk} from '../../../../../libs/schematic-sdk';
import {
    ComponentErrorType,
    DATASETS_EDIT_HISTORY_UNIT_ID,
    TAB_DATASET,
    TAB_FILTERS,
    TAB_SOURCES,
    TOASTERS_NAMES,
} from '../../../constants';
import type {ActionTypeNotification} from '../../../helpers/dataset-error-helpers';
import {getToastTitle} from '../../../helpers/dataset-error-helpers';
import {getComponentErrorsByType} from '../../../helpers/datasets';
import DatasetUtils, {getSourceListingValues} from '../../../helpers/utils';
import {EDIT_HISTORY_OPTIONS_KEY, initialState} from '../../constants';
import {
    datasetContentSelector,
    datasetFieldsSelector,
    datasetIdSelector,
    datasetPreviewSelector,
    datasetValidationSelector,
    isLoadPreviewByDefaultSelector,
    selectedConnectionSelector,
    workbookIdSelector,
} from '../../selectors';
import type {
    ConnectionEntry,
    DatasetError,
    DatasetReduxAction,
    DatasetReduxState,
    EditHistoryOptions,
    EditorItemToDisplay,
    FreeformSource,
    SetCurrentDbName,
    SetCurrentTab,
    SetLastModifiedTab,
    SetSharedDatasetDelegation,
    SetSourcesPagination,
    SetValidationState,
    SourcesPagination,
    ToggleAllowanceSave,
    Update,
    UpdateDescription,
    UpdateSetting,
} from '../../types';
import * as DATASET_ACTION_TYPES from '../types/dataset';

import {checkFetchingPreview, filterSources, isContendChanged, prepareUpdates} from './utils';

export type DatasetDispatch = AppDispatch<DatasetReduxAction>;
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

        getSdk().cancelRequest('getSourceListingOptions');
        getSdk().cancelRequest('getDbNames');
        getSdk().cancelRequest('getSources');

        if (
            (sourceLoadingError && sourceLoadingError.connectionId === connectionId) ||
            !selectedConnections.length
        ) {
            dispatch(setSourcesLoadingError(null));
            dispatch(setSourcesListingOptionsError(null));
        }
    };
}

export function addAvatarPrototypes({
    list,
    templates,
}: {
    list: BaseSource[];
    templates: FreeformSource | null;
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

export function toggleSourcesListingOptionsLoader(isLoading: boolean) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.TOGGLE_SOURCES_LISTING_OPTIONS_LOADER,
            payload: {isLoading},
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

export function setSourcesListingOptionsError(error: DatasetError) {
    return (dispatch: DatasetDispatch) => {
        dispatch({
            type: DATASET_ACTION_TYPES.SET_SOURCES_LISTING_OPTIONS_ERROR,
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
                    data: {
                        dataset: prevContent,
                        updates: prepareUpdates(updates),
                    },
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

export function setValidationState(payload: SetValidationState['payload']): SetValidationState {
    return {
        type: DATASET_ACTION_TYPES.SET_VALIDATION_STATE,
        payload,
    };
}

export function toggletTemplateEnabled(
    templateEnabled: boolean,
    editHistoryOptions?: EditHistoryOptions,
) {
    return (dispatch: Dispatch<DatasetReduxAction>) => {
        batch(() => {
            dispatch({
                type: DATASET_ACTION_TYPES.SET_TEMPLATE_ENABLED,
                payload: {
                    templateEnabled,
                    [EDIT_HISTORY_OPTIONS_KEY]: {
                        ...editHistoryOptions,
                    },
                },
            });
            dispatch(toggleSaveDataset({enable: true}));
        });
    };
}

export function toggletDataExportEnabled(
    dataExportEnabled: boolean,
    editHistoryOptions?: EditHistoryOptions,
) {
    return (dispatch: Dispatch<DatasetReduxAction>) => {
        batch(() => {
            dispatch({
                type: DATASET_ACTION_TYPES.SET_DATA_EXPORT_ENABLED,
                payload: {
                    dataExportEnabled,
                    [EDIT_HISTORY_OPTIONS_KEY]: {
                        ...editHistoryOptions,
                    },
                },
            });
            dispatch(toggleSaveDataset({enable: true}));
        });
    };
}

export function updateSetting(
    name: UpdateSetting['setting']['name'],
    value: boolean,
    editHistoryOptions?: EditHistoryOptions,
) {
    return (dispatch: DatasetDispatch) => {
        const update: UpdateSetting = {
            action: 'update_setting',
            setting: {name, value},
        };
        batch(() => {
            dispatch({
                type: DATASET_ACTION_TYPES.SET_UPDATES,
                payload: {
                    updates: [update],
                    [EDIT_HISTORY_OPTIONS_KEY]: {
                        ...editHistoryOptions,
                    },
                },
            });
            dispatch(updateDatasetByValidation());
        });
    };
}

export function setDatasetDescription(payload: string) {
    return (dispatch: Dispatch<DatasetReduxAction>) => {
        batch(() => {
            const update: UpdateDescription = {
                action: 'update_description',
                description: payload,
            };
            dispatch({
                type: DATASET_ACTION_TYPES.SET_UPDATES,
                payload: {
                    updates: [update],
                },
            });
            dispatch({
                type: DATASET_ACTION_TYPES.SET_DESCRIPTION,
                payload,
            });
            dispatch(toggleSaveDataset({enable: true}));
        });
    };
}

export function resetSourcesPagination(): SetSourcesPagination {
    return {
        type: DATASET_ACTION_TYPES.SET_SOURCES_PAGINATION,
        payload: initialState.sourcesPagination,
    };
}

export function setSourcesPagination(payload: Partial<SourcesPagination>): SetSourcesPagination {
    return {
        type: DATASET_ACTION_TYPES.SET_SOURCES_PAGINATION,
        payload,
    };
}

export function changeCurrentDbName(payload: string) {
    return (dispatch: DatasetDispatch, getState: GetState) => {
        const state = getState();
        const {sourcesPagination} = state.dataset;

        const connection = selectedConnectionSelector(state);
        const workbookId = workbookIdSelector(state);

        if (!connection?.entryId || !workbookId) {
            return;
        }

        batch(() => {
            dispatch(setCurrentDbName(payload));
            dispatch(resetSourcesPagination());
            dispatch(
                getSources({
                    connectionId: connection.entryId,
                    workbookId,
                    currentDbName: payload,
                    limit: sourcesPagination.limit,
                    offset: 0,
                }),
            );
        });
    };
}

export function searchSources(searchValue: string) {
    return async (dispatch: DatasetDispatch, getState: GetState) => {
        const state = getState();
        const {sourcesPagination, currentDbName, errors} = state.dataset;

        const connection = selectedConnectionSelector(state);
        const workbookId = workbookIdSelector(state);

        if (
            !connection?.entryId ||
            errors.sourceLoadingError ||
            sourcesPagination.searchValue === searchValue
        ) {
            return;
        }
        dispatch({
            type: DATASET_ACTION_TYPES.SET_SOURCES_SEARCH_LOADING,
            payload: true,
        });
        batch(async () => {
            dispatch(
                setSourcesPagination({...initialState.sourcesPagination, searchValue: searchValue}),
            );
            await dispatch(
                getSources({
                    connectionId: connection.entryId,
                    workbookId,
                    currentDbName,
                    limit: sourcesPagination.limit,
                    offset: 0,
                    searchText: searchValue ? searchValue : undefined,
                }),
            );
            dispatch({
                type: DATASET_ACTION_TYPES.SET_SOURCES_SEARCH_LOADING,
                payload: false,
            });
        });
    };
}

export function setCurrentDbName(payload: string): SetCurrentDbName {
    return {
        type: DATASET_ACTION_TYPES.SET_CURRENT_DB_NAME,
        payload,
    };
}

export function incrementSourcesPage() {
    return async (dispatch: DatasetDispatch, getState: GetState) => {
        const state = getState();
        const connection = selectedConnectionSelector(state);
        const workbookId = workbookIdSelector(state);

        const {
            dataset: {sourcesPagination, currentDbName, errors},
        } = state;

        if (!connection?.entryId || errors.sourceLoadingError) {
            return;
        }
        dispatch({
            type: DATASET_ACTION_TYPES.SOURCES_NEXT_PAGE_REQUEST,
        });

        const sources = await dispatch(
            getSources({
                connectionId: connection.entryId,
                workbookId,
                limit: sourcesPagination.limit,
                offset: (sourcesPagination.page + 1) * sourcesPagination.limit,
                currentDbName,
                searchText: sourcesPagination.searchValue
                    ? sourcesPagination.searchValue
                    : undefined,
                isSideEffect: true,
            }),
        );

        if (sources.length) {
            const list = filterSources(sources);

            dispatch({
                type: DATASET_ACTION_TYPES.SOURCES_NEXT_PAGE_SUCCESS,
                payload: list,
            });
        } else {
            setSourcesPagination({...sourcesPagination, isFetchingNextPage: false});
        }
    };
}

interface GetSourcesProps {
    connectionId: string;
    workbookId: string | null;
    searchText?: string;
    offset?: number;
    currentDbName?: string;
    limit?: number;
    isSideEffect?: boolean;
}

export function getSources({
    connectionId,
    workbookId,
    searchText,
    offset,
    currentDbName,
    limit,
    isSideEffect = false,
}: GetSourcesProps) {
    return async (dispatch: DatasetDispatch, getState: GetState) => {
        const {
            sourcesPagination,
            errors: {sourceListingOptionsError},
        } = getState().dataset;

        if (sourceListingOptionsError) {
            dispatch(setSourcesLoadingError(sourceListingOptionsError));
            dispatch(setSourcesListingOptionsError(null));
            return [];
        }
        if (!isSideEffect) {
            dispatch(toggleSourcesLoader(true));
        }
        let sources: GetSourceResponse['sources'] = [];
        const currentLimit = limit ? limit + 1 : 10000;
        try {
            const result = await getSdk().sdk.bi.getSources(
                {
                    connectionId,
                    workbookId,
                    limit: currentLimit,
                    offset,
                    db_name: currentDbName,
                    search_text: searchText,
                },
                {concurrentId: 'getSources', timeout: TIMEOUT_65_SEC},
            );
            const freeformSources = result.freeform_sources;
            sources = result.sources;

            const templates = freeformSources.length ? freeformSources[0] : null;
            // TODO[2]: tear off the filter after - BI-1603
            const list = filterSources(sources);

            batch(() => {
                if (!isSideEffect) {
                    dispatch(
                        addAvatarPrototypes({
                            templates,
                            list,
                        }),
                    );
                    if (list.length <= sourcesPagination.limit) {
                        dispatch(setSourcesPagination({isFinished: true}));
                    }
                    dispatch(setFreeformSources(freeformSources));
                }
                dispatch(setSourcesLoadingError(null));
            });
        } catch (error) {
            if (!getSdk().sdk.isCancel(error)) {
                logger.logError('dataset: getSources failed', error);
                error.connectionId = connectionId;
                batch(() => {
                    dispatch(
                        addAvatarPrototypes({
                            templates: null,
                            list: [],
                        }),
                    );
                    dispatch(setFreeformSources([]));
                    dispatch(setSourcesLoadingError(error));
                });
            }
        } finally {
            batch(() => {
                const diffs = get(getState(), 'editHistory.units.datasets.diffs', []);
                dispatch(toggleSourcesLoader(false));
                // Set initial history point
                if (!isSideEffect) {
                    dispatch(addEditHistoryPointDs({stacked: Boolean(diffs.length)}));
                }
            });
        }

        return sources;
    };
}

export function getDbNames(connectionIds: string[]) {
    return async (dispatch: DatasetDispatch, getState: GetState) => {
        dispatch(toggleSourcesListingOptionsLoader(true));
        try {
            if (connectionIds.length) {
                const state = getState();
                const {sourceListingOptions} = state.dataset;
                const currentEntryId = selectedConnectionSelector(state)?.entryId;
                const result = await Promise.all(
                    connectionIds.map((id) =>
                        getSdk()
                            .sdk.bi.getDbNames(
                                {connectionId: id},
                                {concurrentId: 'getDbNames', retries: 2},
                            )
                            .then((res) => ({id, ...res})),
                    ),
                );
                const existingDbNames = result.reduce<Record<string, string[]>>((acc, item) => {
                    acc[item.id] = item.db_names;
                    return acc;
                }, {});

                batch(() => {
                    dispatch({
                        type: DATASET_ACTION_TYPES.SET_CONNECTIONS_DB_NAMES,
                        payload: existingDbNames,
                    });
                    if (sourceListingOptions?.db_name_required_for_search && currentEntryId) {
                        dispatch(setCurrentDbName(existingDbNames[currentEntryId]?.[0]));
                    }
                });
            }
        } catch (e) {
            logger.logError('dataset: getDbNames failed', e);
            dispatch(setSourcesListingOptionsError(e));
        } finally {
            dispatch(toggleSourcesListingOptionsLoader(false));
        }
    };
}

interface SaveDatasetProps {
    key?: string;
    workbookId?: WorkbookId;
    collectionId?: CollectionId;
    name?: string;
    history: History;
    isCreationProcess?: boolean;
    isAuto?: boolean;
    isErrorThrows?: boolean;
}

export function saveDataset({
    key,
    workbookId,
    collectionId,
    name,
    history,
    isCreationProcess,
    isAuto = false,
    isErrorThrows = false,
}: SaveDatasetProps) {
    return async (dispatch: DatasetDispatch, getState: GetState) => {
        try {
            dispatch({
                type: DATASET_ACTION_TYPES.DATASET_SAVE_REQUEST,
                payload: {},
            });

            const {
                entryContent,
                dataset: {id, content: dataset, selectedConnections, savingDataset} = {},
            } = getState();
            let datasetId = id;
            const isSharedDataset =
                DatasetUtils.isEnabledFeature(Feature.EnableSharedEntries) && Boolean(collectionId);
            const sharedDatasetDelegationState = savingDataset?.sharedDatasetDelegationState;

            if (isCreationProcess) {
                const creationData: Partial<CreateDatasetArgs> = {
                    dataset: dataset,
                    ...(isAuto && {created_via: 'yt_to_dl'}),
                };

                if (workbookId) {
                    (creationData as CreateWorkbookDatasetArgs).workbook_id = workbookId;
                    creationData.name = name;
                } else if (collectionId) {
                    (creationData as CreateCollectionDatasetArgs).collection_id = collectionId;
                    creationData.name = name;
                } else {
                    const dividedKey = DatasetUtils.divideKey(key);
                    const nameFromKey = dividedKey.pop();
                    (creationData as CreateDirDatasetArgs).dir_path = `${dividedKey.join('/')}/`;
                    creationData.name = nameFromKey;
                }

                const {id: createdDatasetId} = await getSdk().sdk.bi.createDataset(
                    creationData as CreateDatasetArgs,
                );

                datasetId = createdDatasetId;
            } else {
                const validation = await getSdk().sdk.bi.updateDataset({
                    datasetId: datasetId!,
                    data: {
                        dataset: dataset!,
                    },
                });

                dispatch(setValidationData(validation as unknown as ValidateDatasetResponse));
            }

            if (
                isSharedDataset &&
                selectedConnections?.[0].entryId &&
                sharedDatasetDelegationState !== undefined
            ) {
                await getSdk().sdk.us.createSharedEntryBinding(
                    {
                        // when support many connections, US must support many source
                        sourceId: selectedConnections[0].entryId,
                        targetId: datasetId!,
                        delegation: sharedDatasetDelegationState,
                    },
                    {concurrentId: 'createEntityBinding', retries: 2},
                );
            }

            if (!isCreationProcess) {
                const meta = await getSdk().sdk.us.getEntryMeta({entryId: datasetId!});
                const publishedId = meta.publishedId ?? null;
                const entryId = meta.entryId;

                dispatch({
                    type: DATASET_ACTION_TYPES.DATASET_SAVE_SUCCESS,
                    payload: {
                        publishedId,
                    },
                });

                dispatch(
                    setEntryContent({
                        publishedId,
                        revId: publishedId,
                    } as EntryGlobalState),
                );

                if (entryContent.revisionsMode === RevisionsMode.Opened) {
                    await dispatch(
                        loadRevisions({
                            entryId,
                            page: 0,
                        }),
                    );
                }
            } else {
                dispatch({
                    type: DATASET_ACTION_TYPES.DATASET_SAVE_SUCCESS,
                    payload: {},
                });
            }

            if (!isAuto) {
                toaster.add({
                    name: 'success_save_dataset',
                    title: getToastTitle('NOTIFICATION_SUCCESS', 'save'),
                    theme: 'success',
                });
            }

            dispatch(toggleSaveDataset({enable: false}));

            if (isAuto) {
                history.replace(`/datasets/${datasetId}`);
                DatasetUtils.openCreationWidgetPage({datasetId: datasetId!, target: '_self'});
            } else if (isCreationProcess) {
                if (isSharedDataset) {
                    history.push(`/collections/${collectionId}`);
                } else {
                    history.push(`/datasets/${datasetId}`);
                }
            }

            dispatch(resetEditHistoryUnit({unitId: DATASETS_EDIT_HISTORY_UNIT_ID}));
            // Set initial history point, this is necessary so that the first change after saving can be reversed
            dispatch(addEditHistoryPointDs());
        } catch (error) {
            logger.logError('dataset: saveDataset failed', error);
            dispatch({
                type: DATASET_ACTION_TYPES.DATASET_SAVE_FAILURE,
                payload: {
                    error,
                },
            });

            if (isErrorThrows) {
                throw error;
            }
        }
    };
}

export function setActualDataset({history}: {history: History}) {
    return async (dispatch: DatasetDispatch) => {
        await dispatch(saveDataset({history}));

        const searchParams = new URLSearchParams(location.search);
        searchParams.delete(URL_QUERY.REV_ID);
        history.push({
            ...location,
            search: `?${searchParams.toString()}`,
        });
    };
}

export function fetchFieldTypes() {
    return async (dispatch: DatasetDispatch) => {
        let types: DatasetReduxState['types']['data'] | undefined;

        try {
            const response = await getSdk().sdk.bi.getFieldTypes();

            types = response.types
                .map((type) => {
                    const {name, aggregations} = type;
                    const key = `value_${name}`;

                    return {
                        ...type,
                        title: i18n('component.field-editor.view', key),
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
            theme: 'danger',
        });

        return types;
    };
}

interface UpdateDatasetByValidationProps {
    actionTypeNotification?: ActionTypeNotification;
    compareContent?: boolean;
    updatePreview?: boolean;
    validateEnabled?: boolean;
}

export function updateDatasetByValidation({
    actionTypeNotification,
    compareContent = false,
    updatePreview = false,
    validateEnabled = true,
}: UpdateDatasetByValidationProps = {}) {
    return async (dispatch: DatasetDispatch, getState: GetState) => {
        let fetchingPreviewEnabled, updates;

        clearToasters(toaster);
        dispatch(setValidationState({validation: {isPending: false}}));

        if (validateEnabled) {
            updates = await dispatch(validateDataset({compareContent}));
            fetchingPreviewEnabled = checkFetchingPreview({updatePreview, updates});
        }

        const {
            dataset: {
                id: datasetId,
                content: {result_schema: resultSchema, component_errors: componentErrors} = {},
                preview: {previewEnabled, amountPreviewRows} = {},
            } = {},
        } = getState();

        const sourceErrors = getComponentErrorsByType(
            componentErrors!,
            ComponentErrorType.DataSource,
        );
        const fieldErrors = getComponentErrorsByType(componentErrors!, ComponentErrorType.Field);

        if (previewEnabled && (fetchingPreviewEnabled || updatePreview)) {
            if (fieldErrors.length) {
                dispatch(clearDatasetPreview());
            } else {
                const workbookId = workbookIdSelector(getState());

                dispatch(
                    fetchPreviewDataset({
                        datasetId: datasetId!,
                        workbookId,
                        resultSchema: resultSchema!,
                        limit: amountPreviewRows!,
                    }),
                );
            }
        }

        if (actionTypeNotification) {
            toaster.add({
                name: 'success_update_dataset',
                title: getToastTitle('NOTIFICATION_SUCCESS', actionTypeNotification),
                theme: 'success',
            });
        }

        return Promise.resolve({
            updates,
            sourceErrors,
        });
    };
}

function setInitialSources(ids: string[]) {
    return async (dispatch: DatasetDispatch) => {
        try {
            let initialConnections = [];

            if (ids.length) {
                const result = await Promise.allSettled(
                    ids.map((id) =>
                        getSdk().sdk.us.getEntry({
                            entryId: id,
                            includePermissionsInfo: true,
                        }),
                    ),
                );
                const entries = result
                    .filter(
                        (promise): promise is PromiseFulfilledResult<GetEntryResponse> =>
                            promise.status === 'fulfilled',
                    )
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
                        selectedConnections: initialConnections as ConnectionEntry[],
                        selectedConnection: initialConnections[0] as ConnectionEntry,
                    },
                });
            }
        } catch (e) {
            logger.logError('dataset: setInitialSources failed', e);
            console.error(`setInitialSources action failed: ${e}`);
        }
    };
}

export function initializeDataset({
    connectionId,
    collectionId,
}: {
    connectionId: string;
    collectionId?: CollectionId;
}) {
    return async (dispatch: DatasetDispatch, getState: GetState) => {
        if (connectionId) {
            await dispatch(setInitialSources([connectionId]));
        }

        if (collectionId) {
            const {selectedConnections} = getState().dataset;
            const connection = selectedConnections[0];
            if (connection) {
                dispatch(
                    openDialog({
                        id: DIALOG_SHARED_ENTRY_PERMISSIONS,
                        props: {
                            // required delegation status, if user close dialog and ignore question
                            onClose: (delegate) => {
                                dispatch(setSharedDatasetDelegation(delegate));
                                dispatch(closeDialog());
                            },
                            onApply: (delegate) => {
                                dispatch(setSharedDatasetDelegation(delegate));
                                dispatch(closeDialog());
                            },
                            open: true,
                            entry: connection,
                        },
                    }),
                );
            }
        }

        dispatch(_getSources());

        dispatch({
            type: DATASET_ACTION_TYPES.INITIALIZE_DATASET,
            payload: {},
        });
    };
}

export function initialFetchDataset({
    datasetId,
    rev_id,
    isInitialFetch = true,
}: {
    datasetId: string;
    rev_id?: string;
    isInitialFetch?: boolean;
}) {
    return async (dispatch: DatasetDispatch, getState: GetState) => {
        try {
            if (isInitialFetch) {
                dispatch({
                    type: DATASET_ACTION_TYPES.DATASET_INITIAL_FETCH_REQUEST,
                    payload: {},
                });
            } else {
                dispatch({
                    type: DATASET_ACTION_TYPES.DATASET_FETCH_REQUEST,
                    payload: {},
                });
            }

            const meta = await getSdk().sdk.us.getEntryMeta({entryId: datasetId});
            const workbookId = meta.workbookId ?? null;

            const dataset = await getSdk().sdk.bi.getDatasetByVersion({
                datasetId,
                workbookId,
                rev_id,
            });

            const {
                collection_id: collectionId,
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

            const publishedId = meta.publishedId ?? null;
            const currentRevId = rev_id ?? publishedId;

            dispatch({
                type: DATASET_ACTION_TYPES.DATASET_INITIAL_FETCH_SUCCESS,
                payload: {
                    dataset: dataset as Dataset,
                    publishedId,
                    currentRevId,
                    collectionId: collectionId ?? null,
                },
            });

            dispatch(_getSources());

            dispatch(validateDataset({initial: true}));

            const {
                dataset: {
                    content: {
                        result_schema: resultSchema,
                        load_preview_by_default: loadPreviewByDefault,
                    } = {},
                    preview: {amountPreviewRows} = {},
                } = {},
            } = getState();

            if (previewEnabled) {
                if (loadPreviewByDefault) {
                    dispatch(
                        fetchPreviewDataset({
                            datasetId,
                            workbookId,
                            resultSchema: resultSchema!,
                            limit: amountPreviewRows!,
                        }),
                    );
                } else {
                    dispatch(closePreview());
                    dispatch(queuePreviewToOpen(true));
                }
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

function _getSources() {
    return async (dispatch: DatasetDispatch, getState: GetState) => {
        const {
            dataset: {
                sourcesPagination,
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
            const {currentDbName, sourceListing} = await dispatch(
                getSourcesListingOptions(entryId),
            );
            const {serverPagination, dbNameRequiredForSearch} =
                getSourceListingValues(sourceListing);

            dispatch(
                getSources({
                    connectionId: entryId,
                    workbookId: workbookId,
                    limit: serverPagination ? sourcesPagination.limit : undefined,
                    currentDbName: dbNameRequiredForSearch ? currentDbName : undefined,
                }),
            );
        }
    };
}

export function getSourcesListingOptions(connectionId: string) {
    return async (dispatch: DatasetDispatch, getState: GetState) => {
        dispatch(toggleSourcesListingOptionsLoader(true));
        let sourceListing: SourceListingOptions['source_listing'] | undefined;
        try {
            const result = await (DatasetUtils.isEnabledFeature(
                Feature.EnableDatasetSourcesPagination,
            )
                ? getSdk().sdk.bi.getSourceListingOptions(
                      {connectionId},
                      {concurrentId: 'getSourceListingOptions', retries: 2},
                  )
                : undefined);
            sourceListing = result?.source_listing;

            dispatch({
                type: DATASET_ACTION_TYPES.SET_SOURCES_LISTING_OPTIONS,
                payload: sourceListing,
            });

            const {dbNameRequiredForSearch, supportsDbNameListing} =
                getSourceListingValues(sourceListing);

            if (dbNameRequiredForSearch || supportsDbNameListing) {
                await dispatch(getDbNames([connectionId]));
            }
        } catch (error) {
            logger.logError('dataset: getSourcesListingOptions failed', error);
            dispatch(setSourcesListingOptionsError(error));
        } finally {
            dispatch(toggleSourcesListingOptionsLoader(false));
        }

        const currentDbName = getState().dataset.currentDbName;

        return {sourceListing, currentDbName};
    };
}

export function setSharedDatasetDelegation(delegation: boolean): SetSharedDatasetDelegation {
    return {
        type: DATASET_ACTION_TYPES.SET_SHARED_DATASET_DELEGATION,
        payload: delegation,
    };
}
