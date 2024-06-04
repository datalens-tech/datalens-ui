import get from 'lodash/get';
import type {YandexDocumentUpdatedSource} from 'shared/schema';

import {ManualError} from '../../../../../utils/errors/manual';
import type {
    CreatedSource,
    CreatingSource,
    UploadedYadoc,
    YadocEditableSource,
    YadocItem,
    YadocReadonlySource,
    YadocSource,
    YadocSourceInfo,
} from '../../typings';

type ShapeUploadedGSheetItemArgs = Partial<Omit<UploadedYadoc, 'data'>> & {
    data: UploadedYadoc['data'];
};

type ShapeUploadedYadocSourceInfoItemArgs = Partial<Omit<YadocSourceInfo, 'data' | 'fileId'>> & {
    fileId: string;
    data: YadocSourceInfo['data'];
};

type ShapeYadocEditableSourceItemArgs = Partial<Omit<YadocEditableSource, 'data'>> & {
    data: YadocEditableSource['data'];
};

type ShapeGSheetReadonlySourceItemArgs = Partial<Omit<YadocReadonlySource, 'data'>> & {
    data: YadocReadonlySource['data'];
};

const shapeError = (
    sourceError: ShapeYadocEditableSourceItemArgs['data']['source']['error'],
): ManualError | undefined => {
    if (!sourceError) {
        return undefined;
    }

    const {code, message} = sourceError;

    return new ManualError({code, message});
};

export const shapeUploadedYadocItem = (args: ShapeUploadedGSheetItemArgs): UploadedYadoc => {
    const {data, replacedSourceId, status = 'in_progress'} = args;
    return {type: 'uploadedYadoc', data, status, replacedSourceId};
};

export const shapeUploadedYadocSourceInfoItem = (
    args: ShapeUploadedYadocSourceInfoItemArgs,
): YadocSourceInfo => {
    const {fileId, data, status = 'in_progress'} = args;
    return {type: 'yadocSourceInfo', fileId, data, status};
};

export const shapeYadocEditableSourceItem = (
    args: ShapeYadocEditableSourceItemArgs,
): YadocEditableSource => {
    const {data, status = 'ready'} = args;
    const sourceError = get(data, ['source', 'error']);
    const error = shapeError(sourceError);

    return {type: 'yadocEditableSource', data, status, error};
};

export const shapeYadocReadonlySourceItem = (
    args: ShapeGSheetReadonlySourceItemArgs,
): YadocReadonlySource => {
    const {data, status = 'ready'} = args;
    return {type: 'yadocReadonlySource', data, status};
};

export const shapeYadocReadonlySourceItemAfterUpdate = (
    args: ShapeYadocEditableSourceItemArgs,
): YadocReadonlySource => {
    const {data, status = 'ready'} = args;
    const file_id = get(data, ['file_id']);
    const first_line_is_header = get(data, ['data_settings', 'first_line_is_header']);
    const id = get(data, ['source', 'source_id']);
    const title = get(data, ['source', 'title']);
    const sheet_id = get(data, ['source', 'sheet_id']);
    const raw_schema = get(data, ['source', 'raw_schema']);
    const preview = get(data, ['source', 'preview']);
    const private_path = get(data, ['source', 'private_path']);
    const public_link = get(data, ['source', 'public_link']);
    const sourceError = get(data, ['source', 'error']);
    const error = shapeError(sourceError);

    return {
        type: 'yadocReadonlySource',
        status,
        data: {
            file_id,
            first_line_is_header,
            id,
            status,
            title,
            sheet_id,
            raw_schema,
            preview,
            private_path,
            public_link,
        },
        error,
    };
};

export const extractYadocItemId = (item?: YadocItem) => {
    switch (item?.type) {
        case 'uploadedYadoc': {
            return item.data.file_id;
        }
        case 'yadocSourceInfo': {
            return item.data.source_id;
        }
        case 'yadocEditableSource': {
            return item.data.source.source_id;
        }
        case 'yadocReadonlySource': {
            return item.data.id;
        }
        default: {
            return '';
        }
    }
};

export const getYadocItemIndex = (items: YadocItem[], id?: string) => {
    return items.findIndex((item) => extractYadocItemId(item) === id);
};

export const getFilteredYadocItems = (items: YadocItem[], id: string) => {
    return items.filter((item) => extractYadocItemId(item) !== id);
};

export const isYadocSourceItem = (item: YadocItem): item is YadocSource => {
    return item.type === 'yadocEditableSource' || item.type === 'yadocReadonlySource';
};

const yadocSourceToAPIFormat = (source: YadocSource): CreatingSource | CreatedSource => {
    if (source.type === 'yadocReadonlySource') {
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

export const mapYadocItemsToAPIFormat = (items: YadocItem[]) => {
    return items.reduce(
        (acc, item) => {
            if (isYadocSourceItem(item)) {
                acc.push(yadocSourceToAPIFormat(item));
            }

            return acc;
        },
        [] as (CreatingSource | CreatedSource)[],
    );
};

export const findUploadedYadoc = (items: YadocItem[], id: string) => {
    const resultItem = items.find((item) => {
        if (item.type === 'uploadedYadoc') {
            return extractYadocItemId(item) === id;
        }

        return false;
    });

    return resultItem as UploadedYadoc | undefined;
};

export const getYadocSourceItemTitle = (item?: YadocItem) => {
    if (!item || !isYadocSourceItem(item)) {
        return undefined;
    }

    return 'source' in item.data ? item.data.source.title : item.data.title;
};

const yadocSourceToUpdateAPIFormat = (source: YadocSource): YandexDocumentUpdatedSource => {
    if (source.type === 'yadocEditableSource') {
        const first_line_is_header = get(source, ['data', 'data_settings', 'first_line_is_header']);
        const id = get(source, ['data', 'source', 'source_id']);
        const title = get(source, ['data', 'source', 'title']);
        const sheet_id = get(source, ['data', 'source', 'sheet_id']);
        const private_path = get(source, ['data', 'source', 'private_path']);
        const public_link = get(source, ['data', 'source', 'public_link']);

        return {first_line_is_header, id, title, sheet_id, private_path, public_link};
    }

    const first_line_is_header = get(source, ['data', 'first_line_is_header']);
    const id = get(source, ['data', 'id']);
    const title = get(source, ['data', 'title']);
    const sheet_id = get(source, ['data', 'sheet_id']);
    const private_path = get(source, ['data', 'private_path']);
    const public_link = get(source, ['data', 'public_link']);

    return {first_line_is_header, id, title, sheet_id, private_path, public_link};
};

export const mapYadocItemsToUpdateAPIFormat = (items: YadocItem[]) => {
    return items.reduce<YandexDocumentUpdatedSource[]>((acc, item) => {
        if (isYadocSourceItem(item)) {
            acc.push(yadocSourceToUpdateAPIFormat(item));
        }

        return acc;
    }, []);
};
