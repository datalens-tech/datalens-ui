import {libsControlV1Interop} from './interop/libs/controlV1';
import {libsDatalensV3Interop} from './interop/libs/datalensV3';
import {libsDatasetV2Interop} from './interop/libs/datasetV2';
import {libsQlChartV1Interop} from './interop/libs/qlChartV1';

export const prepare = `const console = {log};
function require(name) {
    const lowerName = name.toLowerCase();
    if (lowerName === 'libs/datalens/v3') {
        return ${libsDatalensV3Interop.prepareAdapter};
    } else if (lowerName === 'libs/control/v1') {
        return ${libsControlV1Interop.prepareAdapter};
    } else if (lowerName === 'libs/qlchart/v1') {
        return ${libsQlChartV1Interop.prepareAdapter};
    } else if (lowerName === 'libs/dataset/v2') {
        return ${libsDatasetV2Interop.prepareAdapter};
    } else if (modules[lowerName]) {
        return modules[lowerName];
    } else {
        throw new Error(\`Module "\${lowerName}" is not resolved\`);
    }
}
const ChartEditor = {};
ChartEditor.getSharedData = () => JSON.parse(_ChartEditor_getSharedData());
ChartEditor.setSharedData = (override) => _ChartEditor_setSharedData(JSON.stringify(override));
ChartEditor.getLang = () => _ChartEditor_userLang;
ChartEditor.attachHandler = (handlerConfig) => JSON.parse(_ChartEditor_attachHandler(JSON.stringify(handlerConfig)));
ChartEditor.attachFormatter = (formatterConfig) => JSON.parse(_ChartEditor_attachFormatter(JSON.stringify(formatterConfig)));
ChartEditor.getSecrets = () => _ChartEditor_getSecrets && JSON.parse(_ChartEditor_getSecrets());
ChartEditor.resolveRelative = (...params) => _ChartEditor_resolveRelative(...params);
ChartEditor.resolveInterval = (intervalStr) => _ChartEditor_resolveInterval(intervalStr);
ChartEditor.resolveOperation = (input) => JSON.parse(_ChartEditor_resolveOperation(JSON.stringify(input)));
ChartEditor.setError = (value) => _ChartEditor_setError(JSON.stringify(value));
ChartEditor._setError = ChartEditor.setError;
ChartEditor.getWidgetConfig = () => JSON.parse(_ChartEditor_getWidgetConfig());
ChartEditor.getActionParams = () => JSON.parse(_ChartEditor_getActionParams());
ChartEditor.wrapFn = (value) => {
        const fnArgs = Array.isArray(value.args)
            ? value.args.map(arg =>
                  typeof arg === 'function' ? arg.toString() : arg,
              )
            : value.args;

        return {
            [_ChartEditor_wrapFn_WRAPPED_FN_KEY]: {
                fn: value.fn.toString(),
                args: fnArgs,
            },
        };
    };

ChartEditor.wrapFn = (value) => ({
    [_ChartEditor_wrapHtml_WRAPPED_HTML_KEY]: value,
});

ChartEditor.getParams = () => JSON.parse(_ChartEditor_getParams());
ChartEditor.getParam = () => JSON.parse(_ChartEditor_getParam(paramName));

ChartEditor.getSortParams = () => JSON.parse(_ChartEditor_getSortParams());

ChartEditor.getCurrentPage = () => _ChartEditor_currentPage;

ChartEditor.updateParams = (params) => _ChartEditor_updateParams(JSON.stringify(params));
ChartEditor.updateActionParams = (params) => _ChartEditor_updateActionParams(JSON.stringify(params));

ChartEditor.getLoadedData = () => JSON.parse(_ChartEditor_getLoadedData());

ChartEditor.updateHighchartsConfig = (config) => _ChartEditor_updateHighchartsConfig(JSON.stringify(config));
ChartEditor.setDataSourceInfo = (dataSourceKey, info) => _ChartEditor_setDataSourceInfo(dataSourceKey, JSON.stringify(info));


const exports = {};
const module = {exports};`;
