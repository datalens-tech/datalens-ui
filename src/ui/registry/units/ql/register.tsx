import ViewSetup from '../../../units/ql/containers/QL/ViewSetup/ViewSetup';
import {getConnectionsByChartType} from '../../../units/ql/utils/connectionts';
import {registry} from '../../index';

export const registerQlPlugins = () => {
    registry.ql.components.registerMany({
        QlUnconfiguredChartView: ViewSetup,
    });
    registry.ql.functions.register({
        getConnectionsByChartType,
    });
};
