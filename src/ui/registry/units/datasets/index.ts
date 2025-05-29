import {createComponentsRegistry} from 'ui/registry/utils/components-registry';

import {createFunctionsRegistry} from '../../../../shared/utils/functions-registry';

import {datasetsComponentsMap} from './components-map';
import {datasetsFunctionsMap} from './functions-map';

const datasetsComponentsRegistry = createComponentsRegistry(datasetsComponentsMap);
const datasetsFunctionsRegistry = createFunctionsRegistry(datasetsFunctionsMap);

const datasetsRegistry = {
    components: datasetsComponentsRegistry,
    functions: datasetsFunctionsRegistry,
};

export default datasetsRegistry;
