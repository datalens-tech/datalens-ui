import type {FeatureConfig, IChartEditor, Palette, QlConfig} from '../../../../../../../shared';
import type {QLConnectionTypeMap} from '../../utils/connection';

export type BuildSourcesArgs = {
    shared: QlConfig;
    ChartEditor: IChartEditor;
    palettes: Record<string, Palette>;
    qlConnectionTypeMap: QLConnectionTypeMap;
    features: FeatureConfig;
};
