import {createFunctionsRegistry} from '../../../../shared/utils/functions-registry';
import {createComponentsRegistry} from '../../utils/components-registry';

import {connectionsComponentsMap} from './components-map';
import {connectionsFunctionsMap} from './functions-map';

const connectionsComponentsRegistry = createComponentsRegistry(connectionsComponentsMap);
const connectionsFunctionsRegistry = createFunctionsRegistry(connectionsFunctionsMap);

const connectionsRegistry = {
    components: connectionsComponentsRegistry,
    functions: connectionsFunctionsRegistry,
};
export default connectionsRegistry;
