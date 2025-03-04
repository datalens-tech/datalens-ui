import type {WidgetType} from '../../../../../shared';
import {EditorType, WizardType, WizardVisualizationId} from '../../../../../shared';

export function isEntryTypeWithFiltering(
    entryType?: WidgetType,
    visualizationType?: WizardVisualizationId,
) {
    const widgetTypesWithFilteringAvailable: WidgetType[] = [
        EditorType.TableNode,
        EditorType.GraphNode,
        EditorType.GravityChartsNode,
        EditorType.BlankChartNode,
    ];

    const wizardEntryTypes = [
        WizardType.GraphWizardNode,
        WizardType.GravityChartsWizardNode,
        WizardType.TableWizardNode,
        WizardType.YmapWizardNode,
    ];

    if (wizardEntryTypes.includes(entryType as WizardType)) {
        const visualizationWithoutFiltering = [WizardVisualizationId.Treemap];
        return !visualizationWithoutFiltering.includes(visualizationType as WizardVisualizationId);
    }

    return entryType && widgetTypesWithFilteringAvailable.includes(entryType);
}
