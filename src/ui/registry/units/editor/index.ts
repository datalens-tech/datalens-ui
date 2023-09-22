import {createFunctionsRegistry} from '../../../../shared/utils/functions-registry';
import {createComponentsRegistry} from '../../utils/components-registry';

import {editorComponentsMap} from './components-map';
import {editorFunctionsMap} from './functions-map';

const editorComponentsRegistry = createComponentsRegistry(editorComponentsMap);
const editorFunctionsRegistry = createFunctionsRegistry(editorFunctionsMap);

const editorRegistry = {
    components: editorComponentsRegistry,
    functions: editorFunctionsRegistry,
};

export default editorRegistry;
