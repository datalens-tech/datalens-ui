export const TOGGLE_NAVIGATION = Symbol('wizard/settings/TOGGLE_NAVIGATION');
export const TOGGLE_FULLSCREEN = Symbol('wizard/settings/TOGGLE_FULLSCREEN');
export const SET_DEFAULTS_SET = Symbol('wizard/settings/SET_DEFAULTS_SET');
export const TOGGLE_VIEW_ONLY_MODE = Symbol('wizard/settings/TOGGLE_VIEW_ONLY_MODE');

interface ToggleNavigationAction {
    type: typeof TOGGLE_NAVIGATION;
    visible?: boolean;
}

export function toggleNavigation(visible?: boolean): ToggleNavigationAction {
    return {
        type: TOGGLE_NAVIGATION,
        visible,
    };
}

interface ToggleFullscreenAction {
    type: typeof TOGGLE_FULLSCREEN;
}

export function toggleFullscreen(): ToggleFullscreenAction {
    return {
        type: TOGGLE_FULLSCREEN,
    };
}

interface ToggleViewOnlyModeAction {
    type: typeof TOGGLE_VIEW_ONLY_MODE;
}

export function toggleViewOnlyMode(): ToggleViewOnlyModeAction {
    return {
        type: TOGGLE_VIEW_ONLY_MODE,
    };
}

interface SetDefaultsSetAction {
    type: typeof SET_DEFAULTS_SET;
}

export function setDefaultsSet(): SetDefaultsSetAction {
    return {
        type: SET_DEFAULTS_SET,
    };
}

export type SettingsAction =
    | SetDefaultsSetAction
    | ToggleFullscreenAction
    | ToggleNavigationAction
    | ToggleViewOnlyModeAction;
