import {DL} from 'ui/constants/common';
import type {UserState} from '../typings/user';
import type {UserAction} from '../actions/user';
import {UPDATE_USER_SETTINGS, SET_THEME} from '../actions/user';
import {getLocalTheme} from 'ui/components/AsideHeaderAdapter/Settings/utils';

const {theme, themeSettings} = getLocalTheme();

function getUserState(): UserState {
    return {
        settings: {
            data: DL.USER_SETTINGS,
            error: null,
            loading: false,
        },
        theme: theme,
        themeSettings: themeSettings,
    };
}

export default function user(state = getUserState(), action: UserAction): UserState {
    switch (action.type) {
        case UPDATE_USER_SETTINGS: {
            return {
                ...state,
                settings: {
                    ...state.settings,
                    data: {...state.settings.data, ...action.payload.userSettings},
                },
            };
        }
        case SET_THEME: {
            return {
                ...state,
                theme: action.payload.theme,
                themeSettings: action.payload.themeSettings,
            };
        }
        default:
            return state;
    }
}
