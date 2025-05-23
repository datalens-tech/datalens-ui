import type {GalleryItem, GalleryItemList} from '../../../types/public-gallery';
import {createAction} from '../../gateway-utils';

export type GetAllItemsResponse = {
    entries: GalleryItemList;
};

export type GetItemResponse = GalleryItem;
export type GetItemArgs = {
    fileId: string;
};

export type GetMetaRespose = {
    editorChoice: {
        ids: string[];
    };
    workOfTheMonth: {title: 'string'; desctiption: string; entryId: string};
};

class NotImplementedError extends Error {
    error: {
        message: string;
        code: string;
        status: number;
    };

    constructor(message: string) {
        super(message);

        this.error = {
            message: message,
            code: 'NOT_IMPLEMENTED',
            status: 404,
        };

        Error.captureStackTrace(this);
    }
}

export const actions = {
    getAllItems: createAction<GetAllItemsResponse>(async () => {
        throw new NotImplementedError('Method getAllItems is not implemented');
    }),
    getItem: createAction<GetItemResponse, GetItemArgs>(async () => {
        throw new NotImplementedError('Method getItem is not implemented');
    }),
    getMeta: createAction<GetMetaRespose>(async () => {
        throw new NotImplementedError('Method getMeta is not implemented');
    }),
};
