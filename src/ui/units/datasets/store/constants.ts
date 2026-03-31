import type {Dataset} from 'shared';
import {DATASET_TAB, Feature} from 'shared';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import type {DatasetTab} from '../constants';
import DatasetUtils, {isCreationProcess} from '../helpers/utils';

import type {DatasetReduxState} from './types';

const getDefaultDatasetContent = (): Partial<Dataset['dataset']> => ({
    avatar_relations: [],
    component_errors: {items: []},
    obligatory_filters: [],
    result_schema: [],
    result_schema_aux: {inter_dependencies: {deps: []}},
    source_avatars: [],
    source_features: {},
    sources: [],
    load_preview_by_default: true,
    rls: {},
});

const isDatasetTab = (value: unknown): value is DatasetTab => {
    return typeof value === 'string' && Object.values(DATASET_TAB).includes(value as DatasetTab);
};

export const getCurrentTab = (): DatasetTab => {
    const defaultTab = isCreationProcess(location.pathname)
        ? DATASET_TAB.SOURCES
        : DATASET_TAB.DATASET;
    const queryTab = DatasetUtils.getQueryParam('tab');

    if (isDatasetTab(queryTab)) {
        if (
            queryTab === DATASET_TAB.CACHE &&
            !isEnabledFeature(Feature.EnableDatasetEarlyInvalidationCache)
        ) {
            return defaultTab;
        }
        return queryTab;
    }

    return defaultTab;
};

export const initialPreview: DatasetReduxState['preview'] = {
    previewEnabled: true,
    readyPreview: 'loading',
    isVisible: true,
    isLoading: true,
    amountPreviewRows: 10,
    view: 'bottom',
    data: [],
    error: null,
    isQueued: false,
};

export const initialState: DatasetReduxState = {
    isRefetchingDataset: false,
    isLoading: true,
    isFavorite: false,
    isDatasetRevisionMismatch: false,
    publishedId: null,
    currentRevId: null,
    id: '',
    key: '',
    workbookId: null,
    collectionId: null,
    connection: null,
    // current content of the dataset
    content: getDefaultDatasetContent(),
    // the previous contents of the dataset, necessary for the validation handle
    prevContent: getDefaultDatasetContent(),
    options: {},
    cacheInvalidationSource: null,
    preview: initialPreview,
    errors: {
        previewError: null,
        savingError: null,
        sourceLoadingError: null,
        validationError: null,
        sourceListingOptionsError: null,
    },
    validation: {
        isLoading: false,
        isPending: false,
        error: null,
    },
    savingDataset: {
        disabled: true,
        isProcessingSavingDataset: false,
        error: null,
        delegationFromConnToSharedDataset: null,
    },
    types: {
        data: [],
        error: null,
    },
    ui: {
        selectedConnectionId: null,
        selectedConnectionDelegationStatus: null,
        isDatasetChanged: false,
        isFieldEditorModuleLoading: false,
        isSourcesLoading: false,
        isSourcesSearchLoading: false,
        isSourcesListingOptionsLoading: false,
    },
    editor: {
        filter: '',
        itemsToDisplay: ['hiddenFields'],
    },
    updates: [],
    connectionsDbNames: {},
    sourcesPagination: {
        page: 0,
        limit: 100,
        isFetchingNextPage: false,
        isFinished: false,
        searchValue: '',
    },
    freeformSources: [],
    selectedConnections: [],
    sourcePrototypes: [],
    sourceTemplate: null,
    error: null,
    currentTab: getCurrentTab(),
};

export const getInitialState = (extra?: Partial<DatasetReduxState>): DatasetReduxState => ({
    ...initialState,
    ...extra,
});

export const EDIT_HISTORY_OPTIONS_KEY = '__editHistoryOptions__';

export const ConnectionUpdateActions = {
    ADD: 'add',
    REPLACE: 'replace',
} as const;
