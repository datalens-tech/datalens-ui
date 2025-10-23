import type {ToastTheme} from '@gravity-ui/uikit';
import isEmpty from 'lodash/isEmpty';
import isObject from 'lodash/isObject';
import type {StringParams} from 'shared/types/common';

export type ToastActivityResultData = {
    type: 'toast';
    data: {
        title?: string;
        content?: string;
        type?: ToastTheme;
    };
};

export type PopupActivityResultData = {
    type: 'popup';
    data: {
        title: string;
        content: string;
    };
};

export type SetParamsActivityResultData = {
    type: 'setParams';
    data: StringParams;
};

export type ActivityResultData =
    | ToastActivityResultData
    | SetParamsActivityResultData
    | PopupActivityResultData;

export function isToastActivity(data: {
    type: unknown;
    data: unknown;
}): data is ToastActivityResultData {
    return (
        data.type === 'toast' &&
        isObject(data.data) &&
        ('title' in data.data || 'content' in data.data)
    );
}

export function isPopupActivityResultData(data: {
    type: unknown;
    data: unknown;
}): data is PopupActivityResultData {
    return (
        data.type === 'popup' &&
        isObject(data.data) &&
        'title' in data.data &&
        'content' in data.data
    );
}

export function isSetParamsActivityResultData(data: {
    type: unknown;
    data: unknown;
}): data is SetParamsActivityResultData {
    return data.type === 'setParams' && isObject(data.data) && !isEmpty(data.data);
}

export function isActivityResultDataValid(data: unknown): data is ActivityResultData {
    if (isObject(data) && 'type' in data && 'data' in data) {
        switch (data.type) {
            case 'toast': {
                return isToastActivity(data);
            }
            case 'setParams': {
                return isSetParamsActivityResultData(data);
            }
            case 'popup': {
                return isPopupActivityResultData(data);
            }
        }
    }

    return false;
}
