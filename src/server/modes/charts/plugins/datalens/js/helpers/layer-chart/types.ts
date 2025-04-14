import type {ServerVisualizationLayer} from '../../../../../../../../shared';

export interface ExtendCombinedChartGraphsArgs {
    graphs: any[];
    layer: ServerVisualizationLayer;
    layers: ServerVisualizationLayer[];
    legendValues: Record<string, string>;
}
