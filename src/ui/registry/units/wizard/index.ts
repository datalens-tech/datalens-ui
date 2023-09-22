import {createFunctionsRegistry} from '../../../../shared/utils/functions-registry';
import {createComponentsRegistry} from '../../utils/components-registry';

import {wizardComponentsMap} from './components-map';

const componentsRegistry = createComponentsRegistry(wizardComponentsMap);
const functionsRegistry = createFunctionsRegistry({});

const wizardRegistry = {
    components: componentsRegistry,
    functions: functionsRegistry,
};
export default wizardRegistry;
