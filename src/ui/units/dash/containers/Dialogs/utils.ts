import {
    EditorType,
    Feature,
    WidgetType,
    WizardType,
    WizardVisualizationId,
} from '../../../../../shared';
import Utils from '../../../../../ui/utils';

export function isEntryTypeWithFiltering(
    entryType?: WidgetType,
    visualizationType?: WizardVisualizationId,
) {
    const wizardFilteringAvailable = Utils.isEnabledFeature(
        Feature.WizardChartChartFilteringAvailable,
    );
    const widgetTypesWithFilteringAvailable: WidgetType[] = [
        EditorType.TableNode,
        EditorType.GraphNode,
    ];

    const wizardEntryTypes = [
        WizardType.GraphWizardNode,
        WizardType.D3WizardNode,
        WizardType.TableWizardNode,
    ];

    if (wizardFilteringAvailable && wizardEntryTypes.includes(entryType as WizardType)) {
        const visualizationWithoutFiltering = [WizardVisualizationId.Treemap];
        return !visualizationWithoutFiltering.includes(visualizationType as WizardVisualizationId);
    }

    return entryType && widgetTypesWithFilteringAvailable.includes(entryType);
}
