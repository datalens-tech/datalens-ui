import {createFunctionsRegistry} from '../../../../shared/utils/functions-registry';

import {authFunctionsMap} from './auth-functions-map';
import {commonFunctionsMap} from './functions-map';

const functionsRegistry = createFunctionsRegistry(commonFunctionsMap);
const authRegistry = createFunctionsRegistry(authFunctionsMap);

const commonRegistry = {
    functions: functionsRegistry,
    auth: authRegistry,
};
export default commonRegistry;
