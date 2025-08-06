import {createComponentsRegistry} from 'ui/registry/utils/components-registry';

import {createFunctionsRegistry} from '../../../../shared/utils/functions-registry';

import {authComponentsMap} from './components-map';
import {authFunctionsMap} from './functions-map';

const componentRegistry = createComponentsRegistry(authComponentsMap);
const functionsRegistry = createFunctionsRegistry(authFunctionsMap);

const authRegistry = {
    components: componentRegistry,
    functions: functionsRegistry,
};

export default authRegistry;
