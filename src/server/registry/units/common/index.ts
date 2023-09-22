import {createFunctionsRegistry} from '../../../../shared/utils/functions-registry';

import {commonFunctionsMap} from './functions-map';

const functionsRegistry = createFunctionsRegistry(commonFunctionsMap);

const commonRegistry = {
    functions: functionsRegistry,
};
export default commonRegistry;
