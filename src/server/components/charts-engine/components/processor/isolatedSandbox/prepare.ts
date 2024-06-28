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
ChartEditor.setSharedData = () => _ChartEditor_setSharedData(JSON.stringify(override));
ChartEditor.getParams = () => JSON.parse(_ChartEditor_getParams());
ChartEditor.getActionParams = () => JSON.parse(_ChartEditor_getActionParams());
ChartEditor.getWidgetConfig = () => JSON.parse(_ChartEditor_getWidgetConfig());
ChartEditor.getLoadedData = () => JSON.parse(_ChartEditor_getLoadedData());
ChartEditor.getSortParams = () => JSON.parse(_ChartEditor_getSortParams());
ChartEditor.updateHighchartsConfig = (config) => _ChartEditor_updateHighchartsConfig(JSON.stringify(config));
ChartEditor.setDataSourceInfo = (dataSourceKey, info) => _ChartEditor_setDataSourceInfo(dataSourceKey, JSON.stringify(info));
ChartEditor.getCurrentPage = () => _ChartEditor_currentPage;

const exports = {};
const module = {exports};`;
