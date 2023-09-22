import {createFunctionsRegistry} from '../../../../shared/utils/functions-registry';
import {createComponentsRegistry} from '../../utils/components-registry';

import {dashComponentsMap} from './components-map';
import {dashFunctionsMap} from './functions-map';

const dashComponentsRegistry = createComponentsRegistry(dashComponentsMap);
const dashFunctionsRegistry = createFunctionsRegistry(dashFunctionsMap);

const dashRegistry = {
    components: dashComponentsRegistry,
    functions: dashFunctionsRegistry,
};

export default dashRegistry;
