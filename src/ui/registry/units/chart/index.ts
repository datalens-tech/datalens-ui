import {createFunctionsRegistry} from '../../../../shared/utils/functions-registry';
import {createComponentsRegistry} from '../../utils/components-registry';

import {chartComponentsMap} from './components-map';
import {chartFunctionsMap} from './functions-map';

const chartComponentsRegistry = createComponentsRegistry(chartComponentsMap);
const chartFunctionsRegistry = createFunctionsRegistry(chartFunctionsMap);

const chartRegistry = {
    components: chartComponentsRegistry,
    functions: chartFunctionsRegistry,
};
export default chartRegistry;
