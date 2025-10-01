import type {EntryScope} from '../../..';
import type {EditorChartData, GetEntryResponse} from '../../types';
import type {GetEditorChartResponse} from '../types/editor';

export const convertGetEntryResponseToGetEditorChartResponse = (
    response: GetEntryResponse,
): GetEditorChartResponse => {
    return {
        ...response,
        type: response.type as any,
        scope: response.scope as EntryScope.Widget,
        data: response.data as EditorChartData,
    };
};
