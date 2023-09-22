import {createFunctionsRegistry} from '../../../../shared/utils/functions-registry';
import {createComponentsRegistry} from '../../utils/components-registry';

import {previewComponentsMap} from './components-map';

const previewComponentsRegistry = createComponentsRegistry(previewComponentsMap);
const previewFunctionsRegistry = createFunctionsRegistry({});

const previewRegistry = {
    components: previewComponentsRegistry,
    functions: previewFunctionsRegistry,
};

export default previewRegistry;
