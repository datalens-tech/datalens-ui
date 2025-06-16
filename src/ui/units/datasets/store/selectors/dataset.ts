import get from 'lodash/get';
import {createSelector} from 'reselect';
import {Feature} from 'shared';
import type {DatasetField} from 'shared';
import type {DatalensGlobalState} from 'ui';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import DatasetUtils from '../../helpers/utils';
import type {BaseSource} from '../types';

export const typesSelector = (state: DatalensGlobalState) => state.dataset.types.data;

export const datasetKeySelector = (state: DatalensGlobalState) => state.dataset.key;
export const datasetIdSelector = (state: DatalensGlobalState) => state.dataset.id;
export const datasetWorkbookId = (state: DatalensGlobalState) => state.dataset.workbookId;
export const datasetContentSelector = (state: DatalensGlobalState) => state.dataset.content;

export const previewEnabledSelector = (state: DatalensGlobalState) =>
    state.dataset.preview.previewEnabled;
export const isDatasetChangedDatasetSelector = (state: DatalensGlobalState) =>
    state.dataset.ui.isDatasetChanged;
export const isLoadingDatasetSelector = (state: DatalensGlobalState) => state.dataset.isLoading;
export const isFavoriteDatasetSelector = (state: DatalensGlobalState) => state.dataset.isFavorite;
export const isSavingDatasetSelector = (state: DatalensGlobalState) =>
    state.dataset.savingDataset.isProcessingSavingDataset;
export const isSavingDatasetDisabledSelector = (state: DatalensGlobalState) =>
    state.dataset.savingDataset.disabled;
export const isDatasetRevisionMismatchSelector = (state: DatalensGlobalState) =>
    state.dataset.isDatasetRevisionMismatch;

export const datasetFieldsSelector = (state: DatalensGlobalState) =>
    state.dataset.content.result_schema!;
export const dataExportEnabledSelector = (state: DatalensGlobalState) =>
    !state.dataset.content.data_export_forbidden;
export const sourcesSelector = (state: DatalensGlobalState) => state.dataset.content.sources;
export const avatarsSelector = (state: DatalensGlobalState) => state.dataset.content.source_avatars;
export const relationsSelector = (state: DatalensGlobalState) =>
    state.dataset.content.avatar_relations;
export const rlsSelector = (state: DatalensGlobalState) => {
    if (isEnabledFeature(Feature.EnableRLSV2)) {
        return state.dataset.content.rls2 || [];
    }

    return state.dataset.content.rls;
};
export const optionsSelector = (state: DatalensGlobalState) => state.dataset.options;

export const datasetPreviewSelector = (state: DatalensGlobalState) => state.dataset.preview;
export const isLoadPreviewByDefaultSelector = (state: DatalensGlobalState) =>
    state.dataset.content.load_preview_by_default;
export const datasetValidationSelector = (state: DatalensGlobalState) => state.dataset.validation;
export const sourceTemplateSelector = (state: DatalensGlobalState) => state.dataset.sourceTemplate;

export const obligatoryFiltersSelector = (state: DatalensGlobalState) =>
    state.dataset.content.obligatory_filters;

export const datasetPreviewErrorSelector = (state: DatalensGlobalState) =>
    state.dataset.errors.previewError;
export const datasetErrorSelector = (state: DatalensGlobalState) => state.dataset.error;
export const datasetSavingErrorSelector = (state: DatalensGlobalState) =>
    state.dataset.errors.savingError;
export const datasetValidationErrorSelector = (state: DatalensGlobalState) =>
    state.dataset.errors.validationError;
export const sourcesErrorSelector = (state: DatalensGlobalState) =>
    state.dataset.errors.sourceLoadingError;
export const componentErrorsSelector = (state: DatalensGlobalState) =>
    state.dataset.content.component_errors;

export const UISelector = (state: DatalensGlobalState) => state.dataset.ui;

export const filteredDatasetFieldsSelector = createSelector(
    datasetFieldsSelector,
    (resultSchema: DatasetField[]) => resultSchema.filter(DatasetUtils.filterDatasetFields),
);

export const filteredDatasetParametersSelector = createSelector(
    datasetFieldsSelector,
    (resultSchema: DatasetField[]) => resultSchema.filter(DatasetUtils.filterDatasetParameters),
);

export const filteredSourcesSelector = createSelector(sourcesSelector, (sources = []) =>
    sources.filter(DatasetUtils.filterVirtual),
);
export const filteredSourceAvatarsSelector = createSelector(avatarsSelector, (sourceAvatars = []) =>
    sourceAvatars.filter(DatasetUtils.filterVirtual),
);
export const filteredRelationsSelector = createSelector(relationsSelector, (avatarRelations = []) =>
    avatarRelations.filter(DatasetUtils.filterVirtual),
);

export const connectionsSelector = (state: DatalensGlobalState) => {
    const {
        selectedConnections,
        content: {sources = []},
    } = state.dataset;

    const usedConnectionsIds = sources.map(({connection_id: connectionId}) => connectionId);

    return selectedConnections.map((connection) => {
        const {id, entryId} = connection;

        const existedConnectionId = id || entryId;

        return {
            ...connection,
            deleteEnabled: !usedConnectionsIds.includes(existedConnectionId),
        };
    });
};

const getSourceHashTitleId = <T extends {parameter_hash: string; title: string}>({
    parameter_hash,
    title,
}: T) => {
    return `${parameter_hash}-${title}`;
};

export const sourcePrototypesSelector = (state: DatalensGlobalState) => {
    const {
        sourcePrototypes = [],
        content: {sources = [], source_avatars: sourceAvatars = []},
    } = state.dataset;

    const availableSourcesMap = new Map(
        sourcePrototypes.map((source) => {
            return [
                getSourceHashTitleId(source),
                source as
                    | BaseSource
                    | {id?: string; isSource?: boolean; isConnectedWithAvatar?: boolean},
            ];
        }),
    );

    const availableSourceAvatars = sourceAvatars.map(({source_id: sourceId}) => sourceId);

    sources.filter(DatasetUtils.filterVirtual).forEach((source) => {
        const {id: sourceId} = source;
        const sourceHashTitleId = getSourceHashTitleId(source);
        const sourcePrototype = availableSourcesMap.get(sourceHashTitleId);

        if (sourcePrototype) {
            availableSourcesMap.set(sourceHashTitleId, {
                ...sourcePrototype,
                id: sourceId,
                isSource: true,
            });
        } else {
            availableSourcesMap.set(sourceHashTitleId, {
                ...source,
                isSource: true,
                isConnectedWithAvatar: availableSourceAvatars.includes(sourceId),
            });
        }
    });

    return Array.from(availableSourcesMap, ([, value]) => value).sort((leftItem, rightItem) => {
        const {isSource: isSourceLeft = false} = leftItem as {isSource?: boolean};
        const {isSource: isSourceRight = false} = rightItem as {isSource?: boolean};

        return Number(isSourceRight) - Number(isSourceLeft);
    });
};

export const selectedConnectionSelector = (state: DatalensGlobalState) => {
    const {ui: {selectedConnectionId} = {}, selectedConnections} = state.dataset;

    return selectedConnections.find((connection) => {
        const {id, entryId} = connection;

        const existedConnectionId = id || entryId;

        return existedConnectionId === selectedConnectionId;
    });
};

export const editorFilterSelector = (state: DatalensGlobalState) => state.dataset.editor.filter;
export const editorItemsToDisplaySelector = (state: DatalensGlobalState) => {
    return state.dataset.editor.itemsToDisplay;
};

export const datasetPermissionsSelector = (state: DatalensGlobalState) => state.dataset.permissions;

export const workbookIdSelector = (state: DatalensGlobalState) => {
    return selectedConnectionSelector(state)?.workbookId || datasetWorkbookId(state) || null;
};

export const currentTabSelector = (state: DatalensGlobalState) => state.dataset.currentTab;

export const templateEnabledSelector = (state: DatalensGlobalState) =>
    state.dataset.content.template_enabled;

export const rawSqlLevelSelector = createSelector(
    connectionsSelector,
    (connections: ReturnType<typeof connectionsSelector>) => {
        let rawSqlLevel = '';

        for (const connection of connections) {
            const possibleValue = get(connection, ['data', 'raw_sql_level'], '') as string;
            if (possibleValue) {
                rawSqlLevel = possibleValue;
            }
        }

        return rawSqlLevel;
    },
);
