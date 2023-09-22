import {DL} from 'ui/constants/common';

import {ROOT_PATH} from '../constants';

export const getInitDestination = (path?: string): string => {
    const destination = DL.USER_FOLDER;

    return !path || path === ROOT_PATH ? destination : path;
};
