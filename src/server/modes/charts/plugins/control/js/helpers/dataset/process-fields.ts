import type {IChartEditor} from '../../../../../../../../shared';
import type {ControlDatasetFields} from '../../types';

const prepareDatasetFields = (fields: ControlDatasetFields) => {
    const datasetFields: Record<string, string> = {};
    const paramsFromDataset: Record<string, string> = {};

    fields.fields.forEach((field) => {
        datasetFields[field.guid] = field.title;
        paramsFromDataset[field.guid] = '';
    });

    const datasetFieldsList = fields.fields.map((field) => {
        const {guid} = field;

        return {
            title: field.title,
            guid,
            dataType: field.data_type,
            calc_mode: field.calc_mode,
            fieldType: field.type,
        };
    });

    return {
        datasetFieldsList,
        paramsFromDataset,
        datasetFields,
    };
};

export const processDatasetFields = (
    datasetId: string,
    fields: ControlDatasetFields | undefined,
    ChartEditor: IChartEditor,
) => {
    if (!fields) {
        return;
    }

    const {datasetFieldsList, paramsFromDataset, datasetFields} = prepareDatasetFields(fields);

    ChartEditor.setExtra('datasets', [
        {
            fields: datasetFields,
            fieldsList: datasetFieldsList,
            id: datasetId,
        },
    ]);

    ChartEditor.updateParams(paramsFromDataset);
};
