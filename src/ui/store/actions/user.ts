import type {ThunkDispatch} from 'redux-thunk';
import type {DatalensGlobalState} from 'ui';
import type {DLUserSettings} from 'shared';
import logger from 'libs/logger';
import {registry} from '../../registry';
import type {Theme, ThemeSettings} from '@gravity-ui/uikit';

type UserDispatch = ThunkDispatch<DatalensGlobalState, void, UserAction>;

export const UPDATE_USER_SETTINGS = Symbol('user/UPDATE_USER_SETTINGS');

export type NewUserSettings = Partial<DLUserSettings>;

type UpdateUserSettingsAction = {
    type: typeof UPDATE_USER_SETTINGS;
    payload: {userSettings: NewUserSettings};
};

export function updateUserSettings({newSettings}: {newSettings: NewUserSettings}) {
    return async (dispatch: UserDispatch) => {
        try {
            const {getUpdatedUserSettings} = registry.common.functions.getAll();
            const userSettings: NewUserSettings | undefined =
                await getUpdatedUserSettings(newSettings);

            if (userSettings) {
                dispatch({type: UPDATE_USER_SETTINGS, payload: {userSettings}});
            }
        } catch (error) {
            logger.logError('updateUserSettings failed', error);
        }
    };
}

export function acceptUserSettings({newSettings}: {newSettings: NewUserSettings}) {
    return function (dispatch: UserDispatch) {
        dispatch({type: UPDATE_USER_SETTINGS, payload: {userSettings: newSettings}});
    };
}

export const SET_THEME = Symbol('user/SET_THEME');

type SetThemeAction = {
    type: typeof SET_THEME;
    payload: {theme: Theme; themeSettings: ThemeSettings};
};

export const setTheme = (payload: SetThemeAction['payload']): SetThemeAction => ({
    type: SET_THEME,
    payload,
});

export type UserAction = UpdateUserSettingsAction | SetThemeAction;
