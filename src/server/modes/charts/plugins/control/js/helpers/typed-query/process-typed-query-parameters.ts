import type {IChartEditor, StringParams} from '../../../../../../../../shared';

export type ProcessTypedQueryParametersArgs = {
    parameters?: StringParams;
    ChartEditor: IChartEditor;
};

export const processTypedQueryParameters = (args: ProcessTypedQueryParametersArgs) => {
    const {parameters, ChartEditor} = args;

    const params = Object.keys(parameters || {}).reduce(
        (acc, key) => Object.assign(acc, {[key]: ''}),
        {} as StringParams,
    );

    ChartEditor.updateParams(params);
};
