export const SET_ITEM = Symbol('localStorageFallback/SET_ITEM');

type SetItemAction = {
    type: typeof SET_ITEM;
    payload: {
        key: string;
        value: string | null;
    };
};

export const setLocalStorageFallbackItem = (key: string, value: string | null): SetItemAction => {
    return {
        type: SET_ITEM,
        payload: {key, value},
    };
};

export type LocalStorageFallbackAction = SetItemAction;
