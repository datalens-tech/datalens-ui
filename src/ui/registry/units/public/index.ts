import {createFunctionsRegistry} from '../../../../shared/utils/functions-registry';
import {createComponentsRegistry} from '../../utils/components-registry';

import {publicComponentsMap} from './components-map';

const publicComponentsRegistry = createComponentsRegistry(publicComponentsMap);
const publicFunctionsRegistry = createFunctionsRegistry({});

const publicRegistry = {
    components: publicComponentsRegistry,
    functions: publicFunctionsRegistry,
};

export default publicRegistry;
