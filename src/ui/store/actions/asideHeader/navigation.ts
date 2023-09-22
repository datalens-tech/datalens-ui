import type {OpenNavigationParams} from 'store/typings/asideHeader';

export const OPEN_NAVIGATION = Symbol('asideHeader/OPEN_NAVIGATION');

export const CLOSE_NAVIGATION = Symbol('asideHeader/CLOSE_NAVIGATION');

export type OpenNavigationAction = {
    type: typeof OPEN_NAVIGATION;
    place?: string;
    startFromNavigation?: string;
};

export const openNavigation = ({
    place,
    startFromNavigation,
}: OpenNavigationParams): OpenNavigationAction => {
    return {
        type: OPEN_NAVIGATION,
        startFromNavigation,
        place,
    };
};

export type CloseNavigationAction = {
    type: typeof CLOSE_NAVIGATION;
};

export const closeNavigation = () => {
    return {
        type: CLOSE_NAVIGATION,
    };
};
