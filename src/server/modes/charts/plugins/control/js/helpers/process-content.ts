import {
    DashTabItemControlSourceType,
    type IChartEditor,
    type StringParams,
} from '../../../../../../../shared';
import {extractTypedQueryParams} from '../../../../../../../shared/modules/typed-query-api/helpers/parameters';
import type {ControlShared} from '../../types';
import type {SourceResponseData} from '../types';

import {processDatasetSourceTypeContent} from './dataset/process-dataset-content';
import {processDatasetFields} from './dataset/process-fields';
import {processTypedQueryContent} from './typed-query/process-typed-query-content';
import {processTypedQueryParameters} from './typed-query/process-typed-query-parameters';

type ProcessContentArgs = {
    data: SourceResponseData;
    shared: ControlShared;
    ChartEditor: IChartEditor;
    params: StringParams;
};
export const processContent = (args: ProcessContentArgs): ControlShared['content'] => {
    const {data, shared, ChartEditor, params} = args;
    const {sourceType, source, content, param} = shared;

    switch (sourceType) {
        case DashTabItemControlSourceType.Dataset: {
            processDatasetFields(source.datasetId, data.fields, ChartEditor);

            return processDatasetSourceTypeContent({shared, distincts: data.distincts});
        }
        case DashTabItemControlSourceType.Connection: {
            processTypedQueryParameters({
                ChartEditor,
                parameters: extractTypedQueryParams(params, param),
            });
            return processTypedQueryContent(data.connectionDistincts);
        }
        default: {
            return content || [];
        }
    }
};
