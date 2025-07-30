import {createComponentsRegistry} from '../../utils/components-registry';

import {fieldEditorComponentsMap} from './components-map';

const fieldEditorComponentsRegistry = createComponentsRegistry(fieldEditorComponentsMap);

export const fieldEditorRegistry = {
    components: fieldEditorComponentsRegistry,
};
