import {getPrepareApiAdapter} from './interop/charteditor-api';
import {libsControlV1Interop} from './interop/libs/control-v1';
import {libsDatalensV3Interop} from './interop/libs/datalens-v3';
import {libsDatasetV2Interop} from './interop/libs/dataset-v2';
import {libsQlChartV1Interop} from './interop/libs/ql-chart-v1';

export const getPrepare = ({noJsonFn}: {noJsonFn: boolean}) => `
var module = {exports: {}};
var exports = module.exports;
const console = {log: (...args) => { 
        const processed = args.map(elem => {
            if (typeof elem === 'function') {
                return elem.toString();
            } else {
                return elem;
            }
        })
        return __log(...processed);
    }
};

const __prepareFunctionsForStringify = (value) => {
    function replaceFunctions(value) {
        if(Array.isArray(value)) {
            return value.map(replaceFunctions);   
        }
        if (typeof value === 'object' && value !== null) {
            const replaced = {};
            Object.keys(value).forEach(key => {
                replaced[key] = replaceFunctions(value[key]);     
            })
            return replaced;
        }
        if (typeof value === 'function') {
            return value.toString();
        }
        return value;
    }
    return replaceFunctions(value);
}

${libsControlV1Interop.prepareAdapter};
${libsDatalensV3Interop.prepareAdapter};
${libsQlChartV1Interop.prepareAdapter}
${libsDatasetV2Interop.prepareAdapter}

function require(name) {
    const lowerName = name.toLowerCase();
    if (lowerName === 'libs/datalens/v3') {
        return datalensV3prepareAdapter;
    } else if (lowerName === 'libs/control/v1') {
        return controlV1prepareAdapter;
    } else if (lowerName === 'libs/qlchart/v1') {
        return qlChartV1prepareAdapter;
    } else if (lowerName === 'libs/dataset/v2') {
        if (__modules['bundledLibraries']) {
            return __modules['bundledLibraries']['dist'].datasetModule;
        } else {
            return datasetV2prepareAdapter;
        }
    } else if (__modules[lowerName]) {
        return __modules[lowerName];
    } else {
        throw new Error(\`Module "\${lowerName}" is not resolved\`);
    }
}

${getPrepareApiAdapter({noJsonFn})}`;
