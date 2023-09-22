import {createFunctionsRegistry} from '../../../../shared/utils/functions-registry';
import {createComponentsRegistry} from '../../utils/components-registry';

import {mainComponentsMap} from './components-map';

const componentsRegistry = createComponentsRegistry(mainComponentsMap);
const functionsRegistry = createFunctionsRegistry({});

const mainRegistry = {
    components: componentsRegistry,
    functions: functionsRegistry,
};
export default mainRegistry;
