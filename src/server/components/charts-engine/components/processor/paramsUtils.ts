import type {StringParams} from '../../../../../shared';

export const getSortParams = (params: StringParams) => {
    const columnId = Array.isArray(params._columnId) ? params._columnId[0] : params._columnId;
    const order = Array.isArray(params._sortOrder) ? params._sortOrder[0] : params._sortOrder;
    const _sortRowMeta = Array.isArray(params._sortRowMeta)
        ? params._sortRowMeta[0]
        : params._sortRowMeta;
    const _sortColumnMeta = Array.isArray(params._sortColumnMeta)
        ? params._sortColumnMeta[0]
        : params._sortColumnMeta;

    let meta: Record<string, any>;
    try {
        meta = {
            column: _sortColumnMeta ? JSON.parse(_sortColumnMeta) : {},
            row: _sortRowMeta ? JSON.parse(_sortRowMeta) : {},
        };
    } catch {
        meta = {};
    }

    return {columnId, order: Number(order), meta};
};

export const getCurrentPage = (params: StringParams): number => {
    const page = Number(Array.isArray(params._page) ? params._page[0] : params._page);
    return isNaN(page) ? 1 : page;
};

export const getParam = (paramName: string, params: StringParams) => {
    return params[paramName] || [];
};
