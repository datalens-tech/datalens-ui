import {get} from 'lodash';
import {ManualError} from 'ui/utils/errors/manual';

import type {GoogleSheetUpdatedSource} from '../../../../../../shared/schema';
import type {
    CreatedSource,
    CreatingSource,
    GSheetEditableSource,
    GSheetItem,
    GSheetReadonlySource,
    GSheetSource,
    GSheetSourceInfo,
    ReplaceSource,
    UploadedGSheet,
} from '../../typings';

type ShapeUploadedGSheetItemArgs = Partial<Omit<UploadedGSheet, 'data'>> & {
    data: UploadedGSheet['data'];
};

type ShapeUploadedGSheetSourceInfoItemArgs = Partial<Omit<GSheetSourceInfo, 'data' | 'fileId'>> & {
    fileId: string;
    data: GSheetSourceInfo['data'];
};

type ShapeGSheetEditableSourceItemArgs = Partial<Omit<GSheetEditableSource, 'data'>> & {
    data: GSheetEditableSource['data'];
};

type ShapeGSheetReadonlySourceItemArgs = Partial<Omit<GSheetReadonlySource, 'data'>> & {
    data: GSheetReadonlySource['data'];
};

const shapeError = (
    sourceError: ShapeGSheetEditableSourceItemArgs['data']['source']['error'],
): ManualError | undefined => {
    if (!sourceError) {
        return undefined;
    }

    const {code, message} = sourceError;

    return new ManualError({code, message});
};

export const shapeUploadedGSheetItem = (args: ShapeUploadedGSheetItemArgs): UploadedGSheet => {
    const {data, replacedSourceId, status = 'in_progress'} = args;
    return {type: 'uploadedGSheet', data, status, replacedSourceId};
};

export const shapeUploadedGSheetSourceInfoItem = (
    args: ShapeUploadedGSheetSourceInfoItemArgs,
): GSheetSourceInfo => {
    const {fileId, data, status = 'in_progress'} = args;
    return {type: 'gsheetSourceInfo', fileId, data, status};
};

export const shapeGSheetEditableSourceItem = (
    args: ShapeGSheetEditableSourceItemArgs,
): GSheetEditableSource => {
    const {data, status = 'ready'} = args;
    const sourceError = get(data, ['source', 'error']);
    const error = shapeError(sourceError);

    return {type: 'gsheetEditableSource', data, status, error};
};

export const shapeGSheetReadonlySourceItem = (
    args: ShapeGSheetReadonlySourceItemArgs,
): GSheetReadonlySource => {
    const {data, status = 'ready'} = args;
    return {type: 'gsheetReadonlySource', data, status};
};

export const shapeGSheetReadonlySourceItemAfterUpdate = (
    args: ShapeGSheetEditableSourceItemArgs,
): GSheetReadonlySource => {
    const {data, status = 'ready'} = args;
    const file_id = get(data, ['file_id']);
    const first_line_is_header = get(data, ['data_settings', 'first_line_is_header']);
    const id = get(data, ['source', 'source_id']);
    const title = get(data, ['source', 'title']);
    const spreadsheet_id = get(data, ['source', 'spreadsheet_id']);
    const sheet_id = get(data, ['source', 'sheet_id']);
    const raw_schema = get(data, ['source', 'raw_schema']);
    const preview = get(data, ['source', 'preview']);
    const sourceError = get(data, ['source', 'error']);
    const error = shapeError(sourceError);

    return {
        type: 'gsheetReadonlySource',
        status,
        data: {
            file_id,
            first_line_is_header,
            id,
            status,
            title,
            spreadsheet_id,
            sheet_id,
            raw_schema,
            preview,
        },
        error,
    };
};

export const extractGSheetItemId = (item?: GSheetItem) => {
    switch (item?.type) {
        case 'uploadedGSheet': {
            return item.data.file_id;
        }
        case 'gsheetSourceInfo': {
            return item.data.source_id;
        }
        case 'gsheetEditableSource': {
            return item.data.source.source_id;
        }
        case 'gsheetReadonlySource': {
            return item.data.id;
        }
        default: {
            return '';
        }
    }
};

export const getGSheetItemIndex = (items: GSheetItem[], id?: string) => {
    return items.findIndex((item) => extractGSheetItemId(item) === id);
};

export const getFilteredGSheetItems = (items: GSheetItem[], id: string) => {
    return items.filter((item) => extractGSheetItemId(item) !== id);
};

export const findUploadedGSheet = (items: GSheetItem[], id: string) => {
    const resultItem = items.find((item) => {
        if (item.type === 'uploadedGSheet') {
            return extractGSheetItemId(item) === id;
        }

        return false;
    });

    return resultItem as UploadedGSheet | undefined;
};

export const isGSheetSourceItem = (item: GSheetItem): item is GSheetSource => {
    return item.type === 'gsheetEditableSource' || item.type === 'gsheetReadonlySource';
};

const gsheetSourceToAPIFormat = (source: GSheetSource): CreatingSource | CreatedSource => {
    if (source.type === 'gsheetReadonlySource') {
        const id = get(source, ['data', 'id']);
        const title = get(source, ['data', 'title']);

        // We don't send file_id to CreatedSource, it breaks processes in uploader
        return {id, title};
    }

    const id = get(source, ['data', 'source', 'source_id']);
    const file_id = get(source, ['data', 'file_id']);
    const title = get(source, ['data', 'source', 'title']);

    return {id, file_id, title};
};

export const mapGSheetItemsToAPIFormat = (items: GSheetItem[]) => {
    return items.reduce(
        (acc, item) => {
            if (isGSheetSourceItem(item)) {
                acc.push(gsheetSourceToAPIFormat(item));
            }

            return acc;
        },
        [] as (CreatingSource | CreatedSource)[],
    );
};

export const getFilteredReplaceSources = (sources: ReplaceSource[], replacedSourceId: string) => {
    const filteredSources = sources.filter(({new_source_id}) => {
        return new_source_id !== replacedSourceId;
    });

    return {
        filteredSources,
        filtered: sources.length !== filteredSources.length,
    };
};

const gsheetSourceToUpdateAPIFormat = (source: GSheetSource): GoogleSheetUpdatedSource => {
    if (source.type === 'gsheetEditableSource') {
        const first_line_is_header = get(source, ['data', 'data_settings', 'first_line_is_header']);
        const id = get(source, ['data', 'source', 'source_id']);
        const title = get(source, ['data', 'source', 'title']);
        const spreadsheet_id = get(source, ['data', 'source', 'spreadsheet_id']);
        const sheet_id = get(source, ['data', 'source', 'sheet_id']);

        return {first_line_is_header, id, title, spreadsheet_id, sheet_id};
    }

    const first_line_is_header = get(source, ['data', 'first_line_is_header']);
    const id = get(source, ['data', 'id']);
    const title = get(source, ['data', 'title']);
    const spreadsheet_id = get(source, ['data', 'spreadsheet_id']);
    const sheet_id = get(source, ['data', 'sheet_id']);

    return {first_line_is_header, id, title, spreadsheet_id, sheet_id};
};

export const mapGSheetItemsToUpdateAPIFormat = (items: GSheetItem[]) => {
    return items.reduce<GoogleSheetUpdatedSource[]>((acc, item) => {
        if (isGSheetSourceItem(item)) {
            acc.push(gsheetSourceToUpdateAPIFormat(item));
        }

        return acc;
    }, []);
};

export const getGSheetSourceItemTitle = (item?: GSheetItem) => {
    if (!item || !isGSheetSourceItem(item)) {
        return undefined;
    }

    return 'source' in item.data ? item.data.source.title : item.data.title;
};
