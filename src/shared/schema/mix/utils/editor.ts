import {EntryScope} from '../../..';
import {ServerError} from '../../../constants/error';
import {isEditorEntryType, isLegacyEditorEntryType} from '../../../utils/entry';
import type {EditorChartData, GetEntryResponse} from '../../types';
import type {GetEditorChartResponse} from '../types/editor';

export const convertGetEntryResponseToGetEditorChartResponse = (
    response: GetEntryResponse,
): GetEditorChartResponse => {
    const scope = response.scope;
    const type = response.type;

    if (
        scope !== EntryScope.Widget ||
        (!isEditorEntryType(type) && !isLegacyEditorEntryType(type))
    ) {
        throw new ServerError('Entry not found', {
            status: 404,
        });
    }

    return {
        ...response,
        scope,
        type,
        data: response.data as EditorChartData,
    };
};
