import {ChartsConfigVersion, ServerVisualization, isYAGRVisualization} from '../../../../../shared';
import {mapQlConfigToLatestVersion} from '../../../../../shared/modules/config/ql';
import type {QlConfig} from '../../../../../shared/types/config/ql';
import buildHighchartsConfigWizard from '../datalens/highcharts';

import buildHighchartsConfig from './highcharts';
import {log} from './utils/misc-helpers';
import buildYagrConfig from './yagr';

export default ({shared}: {shared: QlConfig}) => {
    const config = mapQlConfigToLatestVersion(shared);

    const visualization = config.visualization as ServerVisualization;

    if (isYAGRVisualization(config.chartType, visualization.id)) {
        const result = buildYagrConfig({shared});

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
                version: ChartsConfigVersion.V9,
                datasetsIds: [],
                datasetsPartialFields: [],
            },
        });

        log('LIBRARY CONFIG (WIZARD HC):');
        log(result);

        return result;
    } else {
        const result = buildHighchartsConfig({shared: config});

        log('LIBRARY CONFIG (HC):');
        log(result);

        return result;
    }
};
