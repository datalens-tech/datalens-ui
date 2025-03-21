import {createFunctionsRegistry} from '../../../../shared/utils/functions-registry';

import {datasetsFunctionsMap} from './functions-map';

const datasetsFunctionsRegistry = createFunctionsRegistry(datasetsFunctionsMap);

const datasetsRegistry = {
    functions: datasetsFunctionsRegistry,
};

export default datasetsRegistry;
