import {DashTabItemControlSourceType, type IChartEditor} from '../../../../../../../shared';
import type {ControlShared} from '../../types';
import type {SourceResponseData} from '../types';

import {processDatasetSourceTypeContent} from './dataset/process-dataset-content';
import {processDatasetFields} from './dataset/process-fields';

type ProcessContentArgs = {
    data: SourceResponseData;
    shared: ControlShared;
    ChartEditor: IChartEditor;
};
export const processContent = (args: ProcessContentArgs): ControlShared['content'] => {
    const {data, shared, ChartEditor} = args;
    const {sourceType, source} = shared;

    switch (sourceType) {
        case DashTabItemControlSourceType.Dataset: {
            processDatasetFields(source.datasetId, data.fields, ChartEditor);

            return processDatasetSourceTypeContent({shared, distincts: data.distincts});
        }
        default: {
            return [];
        }
    }
};
