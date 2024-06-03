import type {Field} from 'shared';
import {PlaceholderId, WizardVisualizationId, isDimensionField} from 'shared';
import type {TableSubTotalsSettings} from 'shared/types/wizard/sub-totals';

export const isSubTotalsAvailableInDialogField = (
    visualizationId: WizardVisualizationId | undefined,
    placeholderId: PlaceholderId | undefined,
    field: Field | undefined,
) => {
    if (visualizationId !== WizardVisualizationId.PivotTable) {
        return false;
    }

    if (
        placeholderId !== PlaceholderId.PivotTableRows &&
        placeholderId !== PlaceholderId.PivotTableColumns
    ) {
        return false;
    }

    return field && isDimensionField(field);
};

export const getDefaultSubTotalsSettings = (): TableSubTotalsSettings => {
    return {
        enabled: false,
    };
};
