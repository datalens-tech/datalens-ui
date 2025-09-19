import {createFunctionsRegistry} from '../../../utils/functions-registry';

import {gatewayAuthFunctionsMap} from './functions-map';

const functionsRegistry = createFunctionsRegistry(gatewayAuthFunctionsMap);

const gatewayAuthRegistry = {
    functions: functionsRegistry,
};

export default gatewayAuthRegistry;
