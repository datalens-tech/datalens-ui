import {PlaceholderId, WizardVisualizationId} from 'shared';

export function isSharedPlaceholder(
    placeholderId: PlaceholderId,
    visualizationId: WizardVisualizationId,
) {
    return (
        visualizationId === WizardVisualizationId.CombinedChart && placeholderId === PlaceholderId.X
    );
}
