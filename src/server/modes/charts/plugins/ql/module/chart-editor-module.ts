import type {
    ConnectorType,
    FeatureConfig,
    IChartEditor,
    Palette,
    QlConfig,
} from '../../../../../../shared';

import privateModule from './private-module';

declare const __features: FeatureConfig;
declare const __palettes: Record<string, Palette>;
declare const __qlConnectionTypeMap: Record<string, ConnectorType>;

const buildLibraryConfig = ({
    shared,
    ChartEditor,
}: {
    shared: QlConfig;
    ChartEditor: IChartEditor;
}) => {
    return privateModule.buildLibraryConfig({shared, ChartEditor, features: __features});
};

const buildSources = ({shared, ChartEditor}: {shared: QlConfig; ChartEditor: IChartEditor}) => {
    return privateModule.buildSources({
        shared,
        ChartEditor,
        palettes: __palettes,
        qlConnectionTypeMap: __qlConnectionTypeMap,
    });
};

const buildGraph = ({shared, ChartEditor}: {shared: QlConfig; ChartEditor: IChartEditor}) => {
    return privateModule.buildGraph({
        shared,
        ChartEditor,
        features: __features,
        palettes: __palettes,
        qlConnectionTypeMap: __qlConnectionTypeMap,
    });
};

const buildChartConfig = ({shared, ChartEditor}: {shared: QlConfig; ChartEditor: IChartEditor}) => {
    return privateModule.buildChartConfig({shared, ChartEditor, features: __features});
};

export default {
    buildLibraryConfig,
    buildSources,
    buildGraph,
    buildChartConfig,
    buildD3Config: privateModule.buildD3Config,
    setConsole: privateModule.setConsole,
};
