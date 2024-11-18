import type {CurrentPageEntry} from 'components/Navigation/types';
import type {AsideHeaderData, AsideHeaderSettings} from 'store/typings/asideHeader';
import type {Optional} from 'utility-types';
import logger from 'libs/logger';
import type {OpenNavigationAction, CloseNavigationAction} from './navigation';
import {registry} from '../../../registry';
import type {AppDispatch} from '../../index';
import type {DatalensGlobalState} from 'ui';
import {selectAsideHeaderData} from 'ui/store/selectors/asideHeader';
export * from './navigation';

export const SET_ASIDE_HEADER_DATA = Symbol('asideHeader/SET_ASIDE_HEADER_DATA');
export const SET_CURRENT_PAGE_ENTRY = Symbol('asideHeader/SET_CURRENT_PAGE_ENTRY');
export const SET_ASIDE_HEADER_SETTINGS = Symbol('asideHeader/SET_ASIDE_HEADER_SETTINGS');
export const RESET_ASIDE_HEADER_SETTINGS = Symbol('asideHeader/RESET_ASIDE_HEADER_SETTINGS');
export const REQUEST_USER_SETTINGS = Symbol('asideHeader/REQUEST_USER_SETTINGS');
export const SET_IS_COMPACT = Symbol('asideHeader/SET_IS_COMPACT');
export const SET_IS_HIDDEN = Symbol('asideHeader/SET_IS_HIDDEN');

type SetAsideHeaderDataAction = {
    type: typeof SET_ASIDE_HEADER_DATA;
    asideHeaderData: AsideHeaderData;
};

export const setAsideHeaderData = (asideHeaderData: AsideHeaderData) => {
    return (dispatch: AppDispatch, getState: () => DatalensGlobalState) => {
        // This action is called to many times while rendering
        // so optimize store dispatches
        // we should check if object is really changed
        const stateHeaderData = selectAsideHeaderData(getState());

        if (stateHeaderData?.size !== asideHeaderData.size) {
            dispatch({
                type: SET_ASIDE_HEADER_DATA,
                asideHeaderData,
            });
        }
    };
};

type SetCurrentPageEntryAction = {
    type: typeof SET_CURRENT_PAGE_ENTRY;
    currentPageEntry: CurrentPageEntry | null;
};

export const setCurrentPageEntry = (
    currentPageEntry: CurrentPageEntry | null,
): SetCurrentPageEntryAction => {
    return {
        type: SET_CURRENT_PAGE_ENTRY,
        currentPageEntry,
    };
};

type SetAsideHeaderSettingsArgs = Optional<AsideHeaderSettings>;

type SetAsideHeaderSettingsAction = {
    type: typeof SET_ASIDE_HEADER_SETTINGS;
    settings: SetAsideHeaderSettingsArgs;
};

export const setAsideHeaderSettings = (
    settings: SetAsideHeaderSettingsArgs,
): SetAsideHeaderSettingsAction => {
    return {
        type: SET_ASIDE_HEADER_SETTINGS,
        settings,
    };
};

type ResetAsideHeaderSettingsAction = {
    type: typeof RESET_ASIDE_HEADER_SETTINGS;
};

export const resetAsideHeaderSettings = (): ResetAsideHeaderSettingsAction => {
    return {
        type: RESET_ASIDE_HEADER_SETTINGS,
    };
};

type SetIsCompactAction = {
    type: typeof SET_IS_COMPACT;
    isCompact: boolean;
};

export const setIsCompact = (isCompact: boolean): SetIsCompactAction => {
    return {
        type: SET_IS_COMPACT,
        isCompact,
    };
};

type SetIsHiddenAction = {
    type: typeof SET_IS_HIDDEN;
    isHidden: boolean;
};

export const setIsHidden = (isHidden: boolean): SetIsHiddenAction => {
    return {
        type: SET_IS_HIDDEN,
        isHidden,
    };
};

export const updateAsideHeaderIsCompact = (isCompact: boolean) => {
    return (dispatch: AppDispatch) => {
        dispatch(setIsCompact(isCompact));
        try {
            const {updateIsCompact} = registry.common.functions.getAll();
            dispatch(updateIsCompact(isCompact));
        } catch (e) {
            logger.logError('updateAsideHeaderIsCompact failed', e);
            console.warn('Failed to update aside header isCompact');
        }
    };
};

export type AsideHeaderAction =
    | OpenNavigationAction
    | CloseNavigationAction
    | SetAsideHeaderDataAction
    | SetCurrentPageEntryAction
    | SetAsideHeaderSettingsAction
    | ResetAsideHeaderSettingsAction
    | SetIsCompactAction
    | SetIsHiddenAction;
