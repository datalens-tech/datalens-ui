import {createFunctionsRegistry} from '../../../../shared/utils/functions-registry';
import {createComponentsRegistry} from '../../utils/components-registry';

import {workbooksComponentsMap} from './components-map';
import {workbooksFunctionsMap} from './functions-map';

const componentsRegistry = createComponentsRegistry(workbooksComponentsMap);
const functionsRegistry = createFunctionsRegistry(workbooksFunctionsMap);

const workbooksRegistry = {
    components: componentsRegistry,
    functions: functionsRegistry,
};

export default workbooksRegistry;
