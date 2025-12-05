import {WizardVisualizationId} from '../../constants';

export function mapD3VisualizationsToStandartOnes(id: string) {
    switch (id) {
        case 'line-d3': {
            return WizardVisualizationId.Line;
        }
        case 'bar-y-d3': {
            return WizardVisualizationId.Bar;
        }
        case 'bar-y-100p-d3': {
            return WizardVisualizationId.Bar100p;
        }
        case 'bar-x-d3': {
            return WizardVisualizationId.Column;
        }
        case 'scatter-d3': {
            return WizardVisualizationId.Scatter;
        }
        case 'pie-d3': {
            return WizardVisualizationId.Pie;
        }
        case 'donut-d3': {
            return WizardVisualizationId.Donut;
        }
        case 'treemap-d3': {
            return WizardVisualizationId.Treemap;
        }
    }

    return id;
}
