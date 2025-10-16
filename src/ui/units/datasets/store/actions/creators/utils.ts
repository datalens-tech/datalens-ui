import isEqual from 'lodash/isEqual';
import pick from 'lodash/pick';
import type {GetSourceResponse, ValidateDatasetUpdate} from 'shared/schema';

import {SUBSELECT_SOURCE_TYPES} from '../../../constants';
import type {DatasetReduxState, Update} from '../../types';

type ContentKey = keyof DatasetReduxState['content'];

const OBSERVED_KEYS: ContentKey[] = [
    'load_preview_by_default',
    'avatar_relations',
    'obligatory_filters',
    'result_schema',
    'rls',
    'source_avatars',
    'sources',
];

export const isContendChanged = (
    prevContent: DatasetReduxState['content'] = {},
    content: DatasetReduxState['content'] = {},
) => {
    return !isEqual(pick(prevContent, OBSERVED_KEYS), pick(content, OBSERVED_KEYS));
};

export const prepareUpdates = (updates: Update[]) => {
    return updates.map((update) => {
        if ('field' in update && update.field.autoaggregated === null) {
            delete update.field.autoaggregated;
        }

        return update as ValidateDatasetUpdate;
    });
};

export function filterSources(sources: GetSourceResponse['sources']) {
    return sources.filter(
        ({source_type: sourceType}) => !SUBSELECT_SOURCE_TYPES.includes(sourceType),
    );
}
