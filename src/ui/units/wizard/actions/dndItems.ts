import update from 'immutability-helper';
import {batch} from 'react-redux';
import {Field, Placeholder, PlaceholderId, Shared, isVisualizationWithLayers} from 'shared';
import {DatalensGlobalState} from 'ui';

import {AppDispatch} from '../../../store';
import {VisualizationState} from '../reducers/visualization';
import {getSelectedLayer, getUniqueId} from '../utils/helpers';

import {
    updateAvailable,
    updateColors,
    updateDashboardFilters,
    updateDashboardParameters,
    updateFilters,
    updateLabels,
    updateLayerFilters,
    updateSegments,
    updateShapes,
    updateSort,
    updateTooltips,
    updateVisualizationPlaceholderItems,
} from './placeholder';
import {updatePreviewAndClientChartsConfig} from './preview';

export const enum PlaceholderAction {
    Insert = 'insert',
    Remove = 'remove',
    Move = 'move',
}

export type ReduxStateKeys = keyof Pick<
    VisualizationState,
    | 'visualization'
    | 'shapes'
    | 'segments'
    | 'colors'
    | 'labels'
    | 'available'
    | 'sort'
    | 'tooltips'
    | 'filters'
    | 'dashboardParameters'
>;

export const placeholderIdToReduxStateKeyMap: Record<PlaceholderId, ReduxStateKeys> = {
    [PlaceholderId.X]: 'visualization',
    [PlaceholderId.Y]: 'visualization',
    [PlaceholderId.Y2]: 'visualization',
    [PlaceholderId.PivotTableRows]: 'visualization',
    [PlaceholderId.PivotTableColumns]: 'visualization',
    [PlaceholderId.FlatTableColumns]: 'visualization',
    [PlaceholderId.Dimensions]: 'visualization',
    [PlaceholderId.Geopoint]: 'visualization',
    [PlaceholderId.Geopoligon]: 'visualization',
    [PlaceholderId.Measures]: 'visualization',
    [PlaceholderId.Grouping]: 'visualization',
    [PlaceholderId.Heatmap]: 'visualization',
    [PlaceholderId.Size]: 'visualization',
    [PlaceholderId.Polyline]: 'visualization',
    [PlaceholderId.Points]: 'visualization',
    [PlaceholderId.LayerFilters]: 'visualization',
    [PlaceholderId.Segments]: 'segments',
    [PlaceholderId.Colors]: 'colors',
    [PlaceholderId.Shapes]: 'shapes',
    [PlaceholderId.Labels]: 'labels',
    [PlaceholderId.Sort]: 'sort',
    [PlaceholderId.Tooltips]: 'tooltips',
    [PlaceholderId.Available]: 'available',
    [PlaceholderId.Filters]: 'filters',
    [PlaceholderId.DashboardFilters]: 'filters',
    [PlaceholderId.DashboardParameters]: 'dashboardParameters',
};
export const placeholderIdToReduxActionMap = {
    [PlaceholderId.Segments]: updateSegments,
    [PlaceholderId.Colors]: updateColors,
    [PlaceholderId.Shapes]: updateShapes,
    [PlaceholderId.Labels]: updateLabels,
    [PlaceholderId.Sort]: updateSort,
    [PlaceholderId.Tooltips]: updateTooltips,
    [PlaceholderId.Available]: updateAvailable,
    [PlaceholderId.Filters]: updateFilters,
    [PlaceholderId.LayerFilters]: updateLayerFilters,
    [PlaceholderId.DashboardFilters]: updateDashboardFilters,
    [PlaceholderId.DashboardParameters]: updateDashboardParameters,
    [PlaceholderId.X]: updateVisualizationPlaceholderItems,
    [PlaceholderId.Y]: updateVisualizationPlaceholderItems,
    [PlaceholderId.Y2]: updateVisualizationPlaceholderItems,
    [PlaceholderId.PivotTableRows]: updateVisualizationPlaceholderItems,
    [PlaceholderId.PivotTableColumns]: updateVisualizationPlaceholderItems,
    [PlaceholderId.FlatTableColumns]: updateVisualizationPlaceholderItems,
    [PlaceholderId.Dimensions]: updateVisualizationPlaceholderItems,
    [PlaceholderId.Geopoint]: updateVisualizationPlaceholderItems,
    [PlaceholderId.Geopoligon]: updateVisualizationPlaceholderItems,
    [PlaceholderId.Measures]: updateVisualizationPlaceholderItems,
    [PlaceholderId.Grouping]: updateVisualizationPlaceholderItems,
    [PlaceholderId.Heatmap]: updateVisualizationPlaceholderItems,
    [PlaceholderId.Size]: updateVisualizationPlaceholderItems,
    [PlaceholderId.Polyline]: updateVisualizationPlaceholderItems,
    [PlaceholderId.Points]: updateVisualizationPlaceholderItems,
    [PlaceholderId.LayerFilters]: updateVisualizationPlaceholderItems,
};

export const UPDATE_PREVIEW_WITHOUT_ARGS_KEYS: Record<string, boolean> = {
    dashboardParameters: true,
    available: true,
};

export const getFieldsFromVisualization = (
    visualization: Shared['visualization'] | undefined,
    placeholderId: PlaceholderId | undefined,
) => {
    if (!visualization || !placeholderId) {
        return [];
    }

    let placeholders: Placeholder[];

    if (isVisualizationWithLayers(visualization)) {
        const currentLayer = getSelectedLayer(visualization);
        placeholders = currentLayer?.placeholders || [];
    } else {
        placeholders = visualization.placeholders;
    }

    const placeholder = placeholders.find((p) => p.id === placeholderId);
    return placeholder?.items || [];
};

export const getSectionFields = (
    key: ReduxStateKeys | null,
    placeholderId: PlaceholderId | undefined,
    visualizationState: VisualizationState,
) => {
    switch (key) {
        case null: {
            return null;
        }
        case 'visualization': {
            const visualization = visualizationState[key];
            return getFieldsFromVisualization(visualization, placeholderId);
        }
        default: {
            const items = [...visualizationState[key]];

            switch (placeholderId) {
                case PlaceholderId.Filters: {
                    return items.filter((item) => !item.unsaved);
                }
                case PlaceholderId.DashboardFilters: {
                    return items.filter((item) => item.unsaved);
                }
                default: {
                    return items;
                }
            }
        }
    }
};

export const removeFieldFromPlaceholder = ({
    fields,
    indexToRemove,
}: {
    fields: Field[];
    indexToRemove: number;
}) => {
    return update(fields, {
        $splice: [[indexToRemove, 1]],
    });
};
export const insertFieldToPlaceholder = ({
    fields,
    insertIndex,
    fieldToInsert,
}: {
    fields: Field[];
    insertIndex: number;
    fieldToInsert: Field;
}) => {
    return update(fields, {
        $splice: [[insertIndex, 0, fieldToInsert]],
    });
};

type MoveFromSectionToAnother = {
    currentSectionFields: Field[] | null;
    currentIndex: number;
    nextSectionFields: Field[] | null;
    nextIndex: number;
    field: Field;
    nextSectionId: PlaceholderId | undefined;
};

const moveFromSectionToAnother = ({
    currentSectionFields,
    currentIndex,
    nextSectionFields,
    nextSectionId,
    nextIndex,
    field,
}: MoveFromSectionToAnother) => {
    const removedField = currentSectionFields?.[currentIndex];
    const updatedCurrentSection = currentSectionFields
        ? removeFieldFromPlaceholder({
              fields: currentSectionFields,
              indexToRemove: currentIndex,
          })
        : null;
    const updatedNextSection = nextSectionFields
        ? insertFieldToPlaceholder({
              fieldToInsert: field,
              insertIndex: nextIndex,
              fields: nextSectionFields,
          })
        : null;

    let onUndoInsert: (() => void) | undefined;

    if (currentSectionFields && nextSectionId === PlaceholderId.Filters) {
        onUndoInsert = () => {
            insertFieldToPlaceholder({
                fields: currentSectionFields,
                insertIndex: currentIndex,
                fieldToInsert: field,
            });
        };
    }

    return {
        removedField,
        updatedCurrentSection,
        updatedNextSection,
        onUndoInsert,
    };
};

type MoveFieldInSection = {
    currentSectionFields: Field[];
    currentIndex: number;
    nextIndex: number;
    field: Field;
};
const moveFieldInSection = ({
    currentSectionFields,
    currentIndex,
    nextIndex,
    field,
}: MoveFieldInSection) => {
    const sectionWithoutField = removeFieldFromPlaceholder({
        fields: currentSectionFields,
        indexToRemove: currentIndex,
    });
    return insertFieldToPlaceholder({
        fields: sectionWithoutField,
        fieldToInsert: field,
        insertIndex: nextIndex,
    });
};

type SwapFieldInSection = {
    currentSectionFields: Field[];
    currentIndex: number;
    nextIndex: number;
};

const swapFieldInSection = ({
    currentSectionFields,
    currentIndex,
    nextIndex,
}: SwapFieldInSection) => {
    const copy = [...currentSectionFields];

    const field = copy[currentIndex];
    copy[currentIndex] = copy[nextIndex];
    copy[nextIndex] = field;

    return copy;
};

type HandleDnDItemUpdateArgs = {
    field: Field;
    currentSectionId: PlaceholderId;
    nextSectionId?: PlaceholderId;
    currentIndex: number;
    nextIndex: number;

    action: 'move-to-section' | 'move-in-section' | 'swap-in-section' | 'replace-to-section';
    onAfterUpdate?: () => void;
    currentSectionAction?: PlaceholderAction;
    nextSectionAction?: PlaceholderAction;
    nextSectionTransform?: (item: Field, action?: 'replace') => Promise<Field>;
    currentSectionTransform?: (item: Field, action?: 'replace') => Promise<Field>;
    onBeforeRemoveItem?: (item: Field) => Promise<void>;
    nextSectionOnBeforeRemoveItem?: (item: Field) => Promise<void>;
    replaceOptions?: {
        listNoRemove?: boolean;
        noRemove?: boolean;
    };
};
export const handleDnDItemUpdate = (args: HandleDnDItemUpdateArgs) => {
    return async function (dispatch: AppDispatch, getState: () => DatalensGlobalState) {
        const {
            field,
            nextSectionAction,
            nextIndex,
            nextSectionId,
            currentIndex,
            currentSectionAction,
            currentSectionId,
            action,
            onAfterUpdate,
            currentSectionTransform,
            nextSectionTransform,
            onBeforeRemoveItem,
            replaceOptions,
            nextSectionOnBeforeRemoveItem,
        } = args;

        const state = getState();
        const visualizationState = state.wizard.visualization;

        const currentSectionKey = placeholderIdToReduxStateKeyMap[currentSectionId]
            ? placeholderIdToReduxStateKeyMap[currentSectionId]
            : null;

        const nextSectionKey =
            nextSectionId && placeholderIdToReduxStateKeyMap[nextSectionId]
                ? placeholderIdToReduxStateKeyMap[nextSectionId]
                : null;

        const currentSectionFields = getSectionFields(
            currentSectionKey,
            currentSectionId,
            visualizationState,
        );

        const nextSectionFields = getSectionFields(
            nextSectionKey,
            nextSectionId,
            visualizationState,
        );

        let updatedCurrentSectionFields: Field[] | null;
        let updatedNextSectionFields: Field[] | null;
        let onUndoInsert: (() => void) | undefined;

        let movedField = field;

        const shouldClearFilters = [PlaceholderId.Filters, PlaceholderId.DashboardFilters].includes(
            currentSectionId,
        );
        if (shouldClearFilters) {
            movedField.filter = undefined;
        }

        if (nextSectionTransform) {
            movedField = await nextSectionTransform(movedField);
        }

        switch (action) {
            case 'move-to-section': {
                movedField.id = getUniqueId('inserted');

                const moveResult = moveFromSectionToAnother({
                    currentIndex,
                    nextIndex,
                    currentSectionFields,
                    nextSectionFields,
                    nextSectionId,
                    field: movedField,
                });

                updatedCurrentSectionFields = moveResult.updatedCurrentSection;
                updatedNextSectionFields = moveResult.updatedNextSection;
                onUndoInsert = moveResult.onUndoInsert;

                if (moveResult.removedField) {
                    const isFieldNotInserted = !updatedNextSectionFields?.some(
                        (field) => moveResult.removedField?.guid === field.guid,
                    );
                    if (onBeforeRemoveItem && isFieldNotInserted) {
                        await onBeforeRemoveItem(moveResult.removedField);
                    }
                }
                break;
            }
            case 'move-in-section': {
                if (!currentSectionFields) {
                    return;
                }

                updatedCurrentSectionFields = moveFieldInSection({
                    currentSectionFields,
                    currentIndex,
                    nextIndex,
                    field: movedField,
                });

                break;
            }
            case 'swap-in-section': {
                if (!currentSectionFields) {
                    return;
                }
                updatedCurrentSectionFields = swapFieldInSection({
                    currentIndex,
                    currentSectionFields,
                    nextIndex,
                });
                break;
            }
            case 'replace-to-section': {
                if (!nextSectionFields) {
                    return;
                }

                const nextSectionItem = currentSectionTransform
                    ? await currentSectionTransform(nextSectionFields[nextIndex])
                    : nextSectionFields[nextIndex];
                const currentSectionItem = movedField;

                if (currentSectionFields && !replaceOptions?.listNoRemove) {
                    const oldItem = currentSectionFields[currentIndex];
                    updatedCurrentSectionFields = update(currentSectionFields, {
                        $splice: [[currentIndex, 1, nextSectionItem]],
                    });
                    if (onBeforeRemoveItem) {
                        await onBeforeRemoveItem(oldItem);
                    }
                }

                if (!replaceOptions?.noRemove) {
                    const oldItem = nextSectionFields[nextIndex];
                    updatedNextSectionFields = update(nextSectionFields, {
                        $splice: [[nextIndex, 1, currentSectionItem]],
                    });
                    if (nextSectionOnBeforeRemoveItem) {
                        await nextSectionOnBeforeRemoveItem(oldItem);
                    }
                }

                break;
            }
            default: {
                return;
            }
        }

        const updateNextSectionFunc =
            nextSectionId && placeholderIdToReduxActionMap[nextSectionId]
                ? placeholderIdToReduxActionMap[nextSectionId]
                : null;

        const updateCurrentSectionFunc =
            currentSectionId && placeholderIdToReduxActionMap[currentSectionId]
                ? placeholderIdToReduxActionMap[currentSectionId]
                : null;

        batch(() => {
            if (updatedNextSectionFields && updateNextSectionFunc) {
                dispatch(
                    updateNextSectionFunc({
                        items: updatedNextSectionFields,
                        options: {
                            action: nextSectionAction,
                            placeholderId: nextSectionId,
                            item: movedField,
                        },
                    }),
                );
            }

            if (updatedCurrentSectionFields && updateCurrentSectionFunc) {
                dispatch(
                    updateCurrentSectionFunc({
                        items: updatedCurrentSectionFields,
                        options: {
                            action: currentSectionAction,
                            onUndoInsert,
                            item: movedField,
                            placeholderId: currentSectionId,
                        },
                    }),
                );
            }

            dispatch(updatePreviewAndClientChartsConfig({}));

            if (onAfterUpdate) {
                onAfterUpdate();
            }
        });
    };
};
