import {exampleFunction} from 'ui/registry/functions/example-function';
import {EXAMPLE_FUNCTION} from 'ui/registry/units/common/constants/functions';

import {getChartkitType} from '../../../libs/DatalensChartkit/ChartKit/helpers/chartkit-adapter';
import {getChartkitPlugins} from '../../../libs/DatalensChartkit/ChartKit/plugins';
import {
    getDefaultChartMenu,
    getPanePreviewChartMenu,
    getWizardChartMenu,
} from '../../../libs/DatalensChartkit/menu/helpers';
import {getChartkitMenuByType} from '../../../libs/DatalensChartkit/modules/menu/menu';
import {registry} from '../../../registry';

export const registerChartPlugins = () => {
    registry.chart.functions.register({
        [EXAMPLE_FUNCTION]: exampleFunction,
        getWizardChartMenu,
        getPanePreviewChartMenu,
        getDefaultChartMenu,
        getChartkitMenuByType,
        getChartkitPlugins,
        getChartkitType,
    });
};
