import type {
    FeatureConfig,
    IChartEditor,
    QlConfig,
    ServerChartsConfig,
    ServerVisualization,
} from '../../../../../../../shared';
import {ChartsConfigVersion, isYAGRVisualization} from '../../../../../../../shared';
import {mapQlConfigToLatestVersion} from '../../../../../../../shared/modules/config/ql';
import {buildHighchartsConfigPrivate as buildHighchartsConfigWizard} from '../../../datalens/highcharts/highcharts';
import {log} from '../../utils/misc-helpers';
import buildYagrConfig from '../../yagr';
import buildHighchartsConfig from '../highcharts';

type BuildLibraryConfigArgs = {
    shared: QlConfig;
    ChartEditor: IChartEditor;
    features: FeatureConfig;
};

export function buildLibraryConfig({shared, ChartEditor, features}: BuildLibraryConfigArgs) {
    const config = mapQlConfigToLatestVersion(shared, {i18n: ChartEditor.getTranslation});

    const visualization = config.visualization as ServerVisualization;

    if (isYAGRVisualization(config.chartType, visualization.id)) {
        const result = buildYagrConfig({shared, ChartEditor});

        log('LIBRARY CONFIG (YAGR):');
        log(result);

        return result;
    } else if (visualization?.placeholders) {
        const result = buildHighchartsConfigWizard({
            // @ts-ignore we are passing empty arrays just as a stub
            shared: {
                ...config,
                filters: [],
                hierarchies: [],
                links: [],
                updates: [],
                version: ChartsConfigVersion.V12,
                datasetsIds: [],
                datasetsPartialFields: [],
            } as ServerChartsConfig,
            features,
        });

        log('LIBRARY CONFIG (WIZARD HC):');
        log(result);

        return result;
    } else {
        const result = buildHighchartsConfig({shared: config, ChartEditor});

        log('LIBRARY CONFIG (HC):');
        log(result);

        return result;
    }
}
