import {getPrepareApiAdapter} from './interop/charteditor-api';
import {libsControlV1Interop} from './interop/libs/control-v1';
import {libsDatalensV3Interop} from './interop/libs/datalens-v3';
import {libsDatasetV2Interop} from './interop/libs/dataset-v2';
import {libsQlChartV1Interop} from './interop/libs/ql-chart-v1';

export const getPrepare = ({noJsonFn, name}: {noJsonFn: boolean; name: string}) => {
    return `
const __name = '${name}';
var module = {exports: {}};
var exports = module.exports;
const console = {log: (...args) => { 
        const processed = args.map(elem => {
            return __prepareFunctionsForStringify(elem);
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
            if (('_isAMomentObject' in value && value._isAMomentObject) || value instanceof Date) {
                return value.toJSON();
            }

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

function __updateParams({
    userParamsOverride,
    params,
    usedParams,
}) {
    if (userParamsOverride) {
        Object.keys(userParamsOverride).forEach((key) => {
            const overridenItem = userParamsOverride[key];

            if (params[key] && params[key].length > 0) {
                if (Array.isArray(overridenItem) && overridenItem.length > 0) {
                    params[key] = overridenItem;
                }
            } else {
                params[key] = overridenItem;
            }

            usedParams[key] = params[key];
        });
    }
}

function __resolveParams(params) {
    Object.keys(params).forEach((param) => {
        const paramValues = params[param];
        paramValues.forEach((value, i) => {
            if (typeof value === 'string') {
                if (value.indexOf('__relative') === 0) {
                    const resolvedRelative = _ChartEditor_resolveRelative(value);

                    if (resolvedRelative) {
                        // BI-1308
                        paramValues[i] = resolvedRelative;
                    }
                } else if (value.indexOf('__interval') === 0) {
                    const resolvedInterval = _ChartEditor_resolveRelative(value);

                    if (resolvedInterval) {
                        // BI-1308
                        const from = resolvedInterval.from;
                        const to = resolvedInterval.to;

                        paramValues[i] = \`__interval_\${from}_\${to}\`;
                    }
                }
            }
        });
    });
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
        if (__modules['bundledLibraries']) {
            return __modules['bundledLibraries']['dist'].controlModule;
        } else {
            return controlV1prepareAdapter;
        }
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
};
