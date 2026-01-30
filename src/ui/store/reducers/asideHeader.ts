import type {AsideHeaderSettings, AsideHeaderState} from '../typings/asideHeader';

import type {AsideHeaderAction} from '../actions/asideHeader';
import {
    OPEN_NAVIGATION,
    CLOSE_NAVIGATION,
    SET_ASIDE_HEADER_DATA,
    SET_CURRENT_PAGE_ENTRY,
    SET_ASIDE_HEADER_SETTINGS,
    RESET_ASIDE_HEADER_SETTINGS,
    SET_IS_COMPACT,
    SET_IS_HIDDEN,
} from '../actions/asideHeader';
import {DL} from '../../constants/common';
import {registry} from '../../registry';
import {
    isHeaderWithoutHelpCenterError,
    isHeaderWithoutNavigationError,
} from 'ui/utils/errorContentTypes';

export function getLandingNavigationSettings() {
    const errorType = DL.LANDING_PAGE_ERROR_TYPE;

    return {
        withHelpCenter: !isHeaderWithoutHelpCenterError(errorType),
        withNavigation: !isHeaderWithoutNavigationError(errorType),
    };
}

const getInitialSettings = (): AsideHeaderSettings => ({
    withHelpCenter: true,
    withNavigation: !DL.HIDE_NAVIGATION,
    navigationType: 'aside',
    ...(DL.IS_LANDING ? getLandingNavigationSettings() : {}),
});

const getInitialState = (): Omit<AsideHeaderState, 'isCompact'> => ({
    startFromNavigation: '',
    panelVisible: false,
    place: '',
    asideHeaderData: {
        // This initial size is used in mobile version
        size: 0,
    },
    settings: getInitialSettings(),
    currentPageEntry: null,
    isHidden: false,
});

const getAsideHeaderInitialState = (): AsideHeaderState => {
    const {getIsCompact} = registry.common.functions.getAll();

    return {
        ...getInitialState(),
        isCompact: getIsCompact(),
    };
};

export default function asideHeader(
    state: AsideHeaderState = getAsideHeaderInitialState(),
    action: AsideHeaderAction,
): AsideHeaderState {
    switch (action.type) {
        case OPEN_NAVIGATION: {
            const {startFromNavigation, place} = action;
            return {
                ...state,
                startFromNavigation: startFromNavigation || '',
                place: place || '',
                panelVisible: true,
            };
        }

        case CLOSE_NAVIGATION: {
            return {
                ...state,
                panelVisible: false,
            };
        }

        case SET_ASIDE_HEADER_DATA: {
            return {
                ...state,
                asideHeaderData: action.asideHeaderData,
            };
        }

        case SET_CURRENT_PAGE_ENTRY: {
            return {
                ...state,
                currentPageEntry: action.currentPageEntry,
            };
        }

        case SET_ASIDE_HEADER_SETTINGS: {
            return {
                ...state,
                settings: {
                    ...state.settings,
                    ...action.settings,
                },
            };
        }

        case RESET_ASIDE_HEADER_SETTINGS: {
            return {
                ...state,
                settings: getInitialSettings(),
            };
        }

        case SET_IS_COMPACT: {
            return {
                ...state,
                isCompact: action.isCompact,
            };
        }

        case SET_IS_HIDDEN: {
            return {
                ...state,
                isHidden: action.isHidden,
            };
        }

        default: {
            return state;
        }
    }
}
