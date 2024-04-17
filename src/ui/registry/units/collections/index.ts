import {createFunctionsRegistry} from 'shared/utils/functions-registry';

import {createComponentsRegistry} from '../../utils/components-registry';

import {collectionsComponentsMap} from './components-map';
import {collectionsFunctionsMap} from './functionts-map';

const collectionsRegistry = {
    components: createComponentsRegistry(collectionsComponentsMap),
    functions: createFunctionsRegistry(collectionsFunctionsMap),
};

export default collectionsRegistry;
