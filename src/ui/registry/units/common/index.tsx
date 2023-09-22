import {createFunctionsRegistry} from '../../../../shared/utils/functions-registry';
import {createComponentsRegistry} from '../../utils/components-registry';

import {commonComponentsMap} from './components-map';
import {commonFunctionsMap} from './functions-map';

const componentRegistry = createComponentsRegistry(commonComponentsMap);
const functionsRegistry = createFunctionsRegistry(commonFunctionsMap);

const commonRegistry = {
    components: componentRegistry,
    functions: functionsRegistry,
};
export default commonRegistry;
