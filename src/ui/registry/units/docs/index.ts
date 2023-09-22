import {createFunctionsRegistry} from '../../../../shared/utils/functions-registry';
import {createComponentsRegistry} from '../../utils/components-registry';

import {docsFunctionsMap} from './functions-map';

const componentsRegistry = createComponentsRegistry({});
const functionsRegistry = createFunctionsRegistry(docsFunctionsMap);

const docsRegistry = {
    components: componentsRegistry,
    functions: functionsRegistry,
};
export default docsRegistry;
