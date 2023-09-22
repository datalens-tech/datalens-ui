import {createFunctionsRegistry} from '../../../../shared/utils/functions-registry';
import {createComponentsRegistry} from '../../utils/components-registry';

import {qlComponentsMap} from './components-map';
import {qlFunctionsMap} from './functions-map';

const componentsRegistry = createComponentsRegistry(qlComponentsMap);
const functionsRegistry = createFunctionsRegistry(qlFunctionsMap);

const qlRegistry = {
    components: componentsRegistry,
    functions: functionsRegistry,
};
export default qlRegistry;
