import {ROWS_MAX_COUNT} from './constants';

export const shouldFetchPreview = (rowsCount: string) => {
    const rowsCountNum = Number(rowsCount);
    return !Number.isNaN(rowsCountNum) && rowsCountNum >= 1 && rowsCountNum <= ROWS_MAX_COUNT;
};
