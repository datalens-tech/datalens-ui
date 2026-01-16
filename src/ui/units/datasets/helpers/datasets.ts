import _memoize from 'lodash/memoize';
import _random from 'lodash/random';
import {getUrlParamFromStr} from 'ui/utils';

import type {Dataset} from '../../../../shared';
import {DL, URL_QUERY} from '../../../constants';
import type {ComponentErrorType} from '../constants';

const YT_FOLDER_NAME = 'YT';
const DISALLOWED_SYMBOLS = /[^\wА-Яа-яЁё-]/g;

const getCurrentPath = () => {
    let path = getUrlParamFromStr(location.search, URL_QUERY.CURRENT_PATH);
    path = decodeURIComponent(path || '');

    // We do not allow you to save the entity to the root folder
    if (!path || path === '/') {
        return undefined;
    }

    return path.endsWith('/') ? path : `${path}/`;
};

const shapeYTPath = () => getCurrentPath() || `${DL.USER_FOLDER}${YT_FOLDER_NAME}`;

export const getAutoCreatedYTDatasetKey = (ytPath?: string) => {
    const entryName = ytPath?.split('/').pop()?.replace(DISALLOWED_SYMBOLS, '');
    const postfix = _random(1000, 9999);

    return `${shapeYTPath()}/${entryName}_${postfix}`;
};

export const getComponentErrorsByType = _memoize(
    (componentErrors: Dataset['dataset']['component_errors'], type: ComponentErrorType) => {
        return componentErrors.items.filter((item) => item.type === type);
    },
    (...args) => JSON.stringify(args),
);
