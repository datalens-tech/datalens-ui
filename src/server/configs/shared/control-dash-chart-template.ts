import {ControlType} from '../../../shared/types';

export default {
    module: 'libs/control/v1',
    identifyParams: () => {
        return {};
    },
    identifyChartType: () => {
        return ControlType.Dash;
    },
    identifyLinks: () => {
        return {};
    },
};
