import {getPrepareApiAdapter} from './interop/charteditor-api';
import {libsControlV1Interop} from './interop/libs/control-v1';
import {libsDatalensV3Interop} from './interop/libs/datalens-v3';
import {libsQlChartV1Interop} from './interop/libs/ql-chart-v1';

export const getPrepare = ({noJsonFn}: {noJsonFn: boolean}) => `
const exports = {};
const module = {exports};
const console = {log};

${libsControlV1Interop.prepareAdapter};
${libsDatalensV3Interop.prepareAdapter};
${libsQlChartV1Interop.prepareAdapter}

function require(name) {
    const lowerName = name.toLowerCase();
    if (lowerName === 'libs/datalens/v3') {
        return datalensV3prepareAdapter;
    } else if (lowerName === 'libs/control/v1') {
        return controlV1prepareAdapter;
    } else if (lowerName === 'libs/qlchart/v1') {
        return qlChartV1prepareAdapter;
    } else if (lowerName === 'libs/dataset/v2') {
        return __modules['bundledLibraries'].datasetModule;
    } else if (__modules[lowerName]) {
        return __modules[lowerName];
    } else {
        throw new Error(\`Module "\${lowerName}" is not resolved\`);
    }
}

${getPrepareApiAdapter({noJsonFn})}`;
