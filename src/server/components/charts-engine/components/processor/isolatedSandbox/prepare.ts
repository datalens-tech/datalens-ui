export const prepare = `const console = {log};
function require(name) {
    const lowerName = name.toLowerCase();
    if (lowerName === 'libs/datalens/v3') {
        return {
            buildSources: (args) => JSON.parse(_libsDatalensV3_buildSources(JSON.stringify(args))),
            buildChartsConfig: (args) =>
                JSON.parse(_libsDatalensV3_buildChartsConfig(JSON.stringify(args))),
            buildGraph: (...args) => JSON.parse(_libsDatalensV3_buildGraph(JSON.stringify(args))),
            buildHighchartsConfig: (args) =>
                JSON.parse(_libsDatalensV3_buildHighchartsConfig(JSON.stringify(args))),
            buildD3Config: (args) =>
                JSON.parse(_libsDatalensV3_buildD3Config(JSON.stringify(args))),
        };
    } else if (lowerName === 'libs/control/v1') {
        return {
            buildSources: (args) => JSON.parse(_libsControlV1_buildSources(JSON.stringify(args))),
            buildGraph: (args) => _libsControlV1_buildGraph(JSON.stringify(args)),
            buildUI: (args) => JSON.parse(_libsControlV1_buildUI(JSON.stringify(args))),
            buildChartsConfig: () => ({}),
            buildHighchartsConfig: () => ({}),
        };
    } else if (lowerName === 'libs/qlchart/v1') {
        return {
            buildSources: (args) => JSON.parse(_libsQlChartV1_buildSources(JSON.stringify(args))),
            buildGraph: (args) => JSON.parse(_libsQlChartV1_buildGraph(JSON.stringify(args))),
            buildChartsConfig: (args) =>
                JSON.parse(_libsQlChartV1_buildChartsConfig(JSON.stringify(args))),
            buildLibraryConfig: (args) =>
                JSON.parse(_libsQlChartV1_buildLibraryConfig(JSON.stringify(args))),
            buildD3Config: (args) => JSON.parse(_libsQlChartV1_buildD3Config(JSON.stringify(args))),
        };
    } else if (lowerName === 'libs/dataset/v2') {
        return {
            buildSources: (arg) => JSON.parse(_libsDatasetV2_buildSources(JSON.stringify(arg))),
            processTableData: (...args) =>
                JSON.parse(_libsDatasetV2_processTableData(JSON.stringify(args))),
            processData: (...args) => JSON.parse(_libsDatasetV2_processData(JSON.stringify(args))),
            OPERATIONS: JSON.parse(_libsDatasetV2_OPERATIONS),
            ORDERS: JSON.parse(_libsDatasetV2_ORDERS),
        };
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
