import {createFunctionsRegistry} from '../../../../shared/utils/functions-registry';

import {authFunctionsMap} from './functions-map';

const functionsRegistry = createFunctionsRegistry(authFunctionsMap);

const authRegistry = {
    functions: functionsRegistry,
};

export default authRegistry;
