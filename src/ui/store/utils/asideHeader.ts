import type {AppThunkAction} from '../index';

export const getIsCompact = (): boolean => {
    const isCompactValue = localStorage.getItem('isCompact');

    if (!isCompactValue) {
        return false;
    }

    return JSON.parse(isCompactValue);
};

export const updateIsCompact = (isCompact: boolean): AppThunkAction => {
    return () => {
        localStorage.setItem('isCompact', JSON.stringify(isCompact));
    };
};
