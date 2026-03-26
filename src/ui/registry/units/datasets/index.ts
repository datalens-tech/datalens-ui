import {createFunctionsRegistry} from '../../../../shared/utils/functions-registry';
import {createComponentsRegistry} from '../../utils/components-registry';

import {datasetsComponentsMap} from './components-map';
import {datasetsFunctionsMap} from './functions-map';

const datasetsComponentsRegistry = createComponentsRegistry(datasetsComponentsMap);
const datasetsFunctionsRegistry = createFunctionsRegistry(datasetsFunctionsMap);

const datasetsRegistry = {
    components: datasetsComponentsRegistry,
    functions: datasetsFunctionsRegistry,
};

export default datasetsRegistry;
