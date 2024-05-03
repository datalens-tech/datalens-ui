import {
    DashTabItemControlElementType,
    DashTabItemControlSourceType,
    DatasetFieldType,
} from '../../../../../../shared';
import {ControlShared} from '../types';

import {prepareDistinctsRequest} from './distincts';
import {prepareFieldsRequest} from './fields';
import {prepareTypedQueryRequest} from './typed-query';
import {SourceControlArgs, SourceControlRequests} from './types';

const buildManualSelectorSources = (shared: ControlShared): Record<PropertyKey, never> => {
    if (shared.source.elementType === DashTabItemControlElementType.Select) {
        shared.content = shared.source.acceptableValues as {
            value: string;
            title: string;
        }[];
    }

    shared.param = shared.source.fieldName;

    return {};
};

export const buildSources = ({
    shared,
    params,
    ChartEditor,
}: SourceControlArgs): SourceControlRequests | Record<PropertyKey, never> => {
    switch (shared.sourceType) {
        case DashTabItemControlSourceType.Manual:
            return buildManualSelectorSources(shared);
        case DashTabItemControlSourceType.Connection:
            return {
                connectionDistincts: prepareTypedQueryRequest({shared, params, ChartEditor}),
            };
        case DashTabItemControlSourceType.Dataset:
        default: {
            const datasetId = shared.source.datasetId;

            shared.param = shared.source.datasetFieldId || shared.source.fieldName;

            const sources: SourceControlRequests = {
                fields: prepareFieldsRequest({datasetId}),
            };

            if (
                shared.source.elementType !== DashTabItemControlElementType.Date &&
                shared.source.elementType !== DashTabItemControlElementType.Input &&
                shared.source.elementType !== DashTabItemControlElementType.Checkbox &&
                shared.source.datasetFieldType !== DatasetFieldType.Measure
            ) {
                sources.distincts = prepareDistinctsRequest({shared, params, ChartEditor});
            }

            return sources;
        }
    }
};
