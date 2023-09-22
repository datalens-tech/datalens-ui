import {MAP_PLACE_TO_SCOPE, PLACE} from '../../../shared';
import {DL} from '../../constants/common';

export {PLACE, MAP_PLACE_TO_SCOPE};

export const MODE_MINIMAL = 'minimal';
export const MODE_FULL = 'full';
export const MODE_MODAL = 'modal';

export const ORDER_DIRECTION = {
    DESC: 'desc',
    ASC: 'asc',
} as const;

export const ORDER_FIELD = {
    CREATED_AT: 'createdAt',
    NAME: 'name',
} as const;

export const OWNERSHIP = {
    ALL: 'all',
    ONLY_MINE: 'onlyMine',
    FAVORITES: 'favorites',
} as const;

export const QUICK_ITEMS = {
    get USER_FOLDER() {
        return DL.USER_FOLDER;
    },
};

export const USER_FOLDER_PLACE = 'userFolder';

export const PLACE_VALUES = Object.values(PLACE);

export const ROOT_PATH = '/';
