import type {IChartEditor, StringParams} from '../../../../../../../../shared';

export type ProcessTypedQueryParametersArgs = {
    parameters?: StringParams;
    ChartEditor: IChartEditor;
};

export const processTypedQueryParameters = (args: ProcessTypedQueryParametersArgs) => {
    const {parameters, ChartEditor} = args;

    ChartEditor.updateParams(parameters || {});
};
