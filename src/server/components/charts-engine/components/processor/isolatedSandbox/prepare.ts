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
ChartEditor.getParams = () => JSON.parse(_params);
ChartEditor.getActionParams = () => JSON.parse(_actionParams);
ChartEditor.getWidgetConfig = () => JSON.parse(_widgetConfig);
ChartEditor.getSharedData = () => JSON.parse(_shared);
ChartEditor.getLoadedData = () => JSON.parse(_getLoadedData);
ChartEditor.getSortParams = () => JSON.parse(_getSortParams());
ChartEditor.updateHighchartsConfig = (config) => _ChartEditor_updateHighchartsConfig(JSON.stringify(config));

const exports = {};
const module = {exports};`;
