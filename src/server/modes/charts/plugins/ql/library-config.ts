import {ChartsConfigVersion, isYAGRVisualization} from '../../../../../shared';
import type {IChartEditor, QlConfig, ServerVisualization} from '../../../../../shared';
import {mapQlConfigToLatestVersion} from '../../../../../shared/modules/config/ql';
import {buildHighchartsConfig as buildHighchartsConfigWizard} from '../datalens/highcharts';

import buildHighchartsConfig from './highcharts';
import {log} from './utils/misc-helpers';
import buildYagrConfig from './yagr';

export default ({shared, ChartEditor}: {shared: QlConfig; ChartEditor: IChartEditor}) => {
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
                version: ChartsConfigVersion.V10,
                datasetsIds: [],
                datasetsPartialFields: [],
            },
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
};
