import {get} from 'lodash';
import type {FileSourcePreview, FileSourceSchema} from 'shared/schema';

import type {GSheetSource} from '../../../../../store';
import {isGSheetSourceItem} from '../../../../../store';
import type {GSheetListItem} from '../../types';

export const getGSheetSourceWorkspaceData = (source: GSheetSource) => {
    let preview: FileSourcePreview = [];
    let schema: FileSourceSchema = [];
    let firstLineIsHeader = false;

    switch (source.type) {
        case 'gsheetEditableSource': {
            preview = get(source, ['data', 'source', 'preview']);
            schema = get(source, ['data', 'source', 'raw_schema']);
            firstLineIsHeader = get(source, ['data', 'data_settings', 'first_line_is_header']);
            break;
        }
        case 'gsheetReadonlySource': {
            preview = get(source, ['data', 'preview']);
            schema = get(source, ['data', 'raw_schema']);
        }
    }

    return {preview, schema, firstLineIsHeader};
};

export const shouldToShowVeil = (item?: GSheetListItem) => {
    return Boolean(item && isGSheetSourceItem(item) && item.status === 'in_progress');
};
