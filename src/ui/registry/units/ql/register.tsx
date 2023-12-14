import ViewSetup from '../../../units/ql/containers/QL/ViewSetup/ViewSetup';
import {registry} from '../../index';

export const registerQlPlugins = () => {
    registry.ql.components.registerMany({
        QlUnconfiguredChartView: ViewSetup,
    });
};
