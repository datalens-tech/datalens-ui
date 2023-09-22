import {
    ChartsConfigVersion,
    QLChartType,
    QLEntryDataShared,
    ServerVisualization,
} from '../../../../../shared';
import buildHighchartsConfigWizard from '../datalens/highcharts';

import buildHighchartsConfig from './highcharts';
import {LINEAR_VISUALIZATIONS} from './utils/constants';
import {log} from './utils/misc-helpers';
import buildYagrConfig from './yagr';

export default ({shared}: {shared: QLEntryDataShared}) => {
    const visualization = shared.visualization as ServerVisualization;

    if (
        (shared.chartType === QLChartType.Monitoringql ||
            shared.chartType === QLChartType.Promql) &&
        LINEAR_VISUALIZATIONS.has(visualization.id)
    ) {
        const result = buildYagrConfig({shared});

        log('LIBRARY CONFIG (YAGR):');
        log(result);

        return result;
    } else if (visualization?.placeholders) {
        const result = buildHighchartsConfigWizard({
            // @ts-ignore we are passing empty arrays just as a stub
            shared: {
                ...shared,
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
        const result = buildHighchartsConfig({shared});

        log('LIBRARY CONFIG (HC):');
        log(result);

        return result;
    }
};
