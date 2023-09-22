import {DatasetFieldType} from '../../../../../../shared';
import {ELEMENT_TYPE, SOURCE_TYPE} from '../constants/misc';
import {ControlShared} from '../types';

import {prepareDistinctsRequest} from './distincts';
import {prepareFieldsRequest} from './fields';
import {SourceControlArgs, SourceControlRequests} from './types';

const buildManualSelectorSources = (shared: ControlShared) => {
    if (shared.source.elementType === ELEMENT_TYPE.SELECT) {
        shared.content = shared.source.acceptableValues as {
            value: string;
            title: string;
        }[];
    }

    shared.param = shared.source.fieldName;

    return {};
};

const buildSources = ({
    shared,
    params,
    ChartEditor,
}: SourceControlArgs): SourceControlRequests | Record<string, any> => {
    switch (shared.sourceType) {
        case SOURCE_TYPE.MANUAL:
            return buildManualSelectorSources(shared);
        case SOURCE_TYPE.DATASET:
        default: {
            const datasetId = shared.source.datasetId;

            shared.param = shared.source.datasetFieldId || shared.source.fieldName;

            const sources: SourceControlRequests = {
                fields: prepareFieldsRequest({datasetId}),
            };

            if (
                shared.source.elementType !== ELEMENT_TYPE.DATE &&
                shared.source.elementType !== ELEMENT_TYPE.INPUT &&
                shared.source.datasetFieldType !== DatasetFieldType.Measure
            ) {
                sources.distincts = prepareDistinctsRequest({shared, params, ChartEditor});
            }

            return sources;
        }
    }
};

export default buildSources;
