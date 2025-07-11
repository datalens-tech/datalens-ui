import type {GalleryItem, GalleryItemList, TranslationsDict} from '../../../types/public-gallery';
import {createAction} from '../../gateway-utils';

export type GetAllItemsResponse = {
    entries: GalleryItemList;
};

export type GetItemResponse = GalleryItem;
export type GetItemArgs = {
    fileId: string;
};

export type GetMetaRespose = {
    /** Works that are shown in the first promo block in a panel colored with the brand color */
    editorChoice: {
        ids: string[];
    };
    /** Works grouped by categories, each block shows the first 3 works from the specified category */
    landingCategories: {
        category: string;
        title: TranslationsDict;
        /** Allows you to set the order of works in the block. If not specified, the first 3 works will be shown */
        ids?: string[];
    }[];
    /** 4 works that are shown on the DL main page */
    mainPage: {
        ids: string[];
    };
    /** Work that is shown in the "Work of the month" block */
    workOfTheMonth: {id: string};
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
