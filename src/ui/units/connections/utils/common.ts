/* eslint no-bitwise: 0 */
import {isTrueArg} from 'shared/modules/url';

import {URL_QUERY} from '../../../constants';

export const getQueryParam = (name = '') => {
    const searchParams = new URLSearchParams(window.location.search);
    const param = searchParams.get(name);

    return param ? decodeURIComponent(param) : undefined;
};

// https://github.com/darkskyapp/string-hash/blob/master/index.js
export const stringToHash = (str: string) => {
    let hash = 5381;
    let i = str.length;

    while (i) {
        hash = (hash * 33) ^ str.charCodeAt(--i);
    }

    return String(hash >>> 0);
};

export const getFormWithTrimmedValues = <T extends {}>(target: T) => {
    return Object.keys(target).reduce((acc, key) => {
        let value = target[key as keyof T];

        if (typeof value === 'string') {
            value = value.trim() as T[keyof T];
        }

        acc[key as keyof T] = value;

        return acc;
    }, {} as T);
};

export const isDebugMode = () => {
    return isTrueArg(getQueryParam(URL_QUERY.DEBUG));
};

const getTrimmedPathname = (pathname: string) => {
    return pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
};

export const getPreviousRalativePathname = () => {
    const trimmedPathname = getTrimmedPathname(window.location.pathname);
    const nextPathName = trimmedPathname.split('/').slice(0, -1).join('/');
    return `${nextPathName}${window.location.search}`;
};

export const getNextRalativePathname = (nextPart: string) => {
    const trimmedPathname = getTrimmedPathname(window.location.pathname);
    const nextPathName = trimmedPathname.split('/').concat(nextPart).join('/');
    return `${nextPathName}${window.location.search}`;
};
