import type {AxiosError} from 'axios';
import type {
    ChartsConfig,
    ClientChartsConfig,
    CommonSharedExtraSettings,
    EntryAnnotationArgs,
    EntryUpdateMode,
    Shared,
} from 'shared';
import type {DatalensGlobalState} from 'ui';
import {WIZARD_DATASET_ID_PARAMETER_KEY} from 'ui/constants/misc';
import {getRouter} from 'ui/navigation';
import type {SaveWidgetArgs} from 'ui/store/actions/chartWidget';
import {saveWidget} from 'ui/store/actions/chartWidget';
import {updateClientChartsConfig} from 'ui/units/wizard/actions/preview';

import {CHART_SETTINGS} from '../constants';
import type {WizardDispatch} from '../reducers';
import {mapClientConfigToChartsConfig} from '../utils/mappers/mapClientToChartsConfig';
import {removeUrlParameters} from '../utils/wizard';

export const RECEIVE_WIDGET = Symbol('wizard/widget/RECEIVE_WIDGET');
export const SET_EXTRA_SETTINGS = Symbol('wizard/widget/SET_EXTRA_SETTINGS');
export const SET_WIDGET_LOAD_STATUS = Symbol('wizard/widget/SET_WIDGET_LOAD_STATUS');
export const SET_WIDGET_KEY = Symbol('wizard/widget/SET_WIDGET_KEY');

export type WidgetData = any;

export type ReceiveWidgetAndPrepareMetadataArgs = {
    data?: WidgetData;
    error?: AxiosError;
    isWidgetWasSaved?: boolean;
    needToProgressLoading?: boolean;
};

export function receiveWidgetAndPrepareMetadata({
    data,
    error,
    isWidgetWasSaved,
    needToProgressLoading,
}: ReceiveWidgetAndPrepareMetadataArgs) {
    return function (dispatch: WizardDispatch) {
        if (data) {
            const entryId = data.entryId;
            if (entryId || isWidgetWasSaved) {
                removeUrlParameters([WIZARD_DATASET_ID_PARAMETER_KEY]);
            }

            const router = getRouter();
            const location = router.location();

            let pathname = '/wizard/';

            if (location.pathname.includes('/preview/')) {
                pathname += 'preview/';
            }

            if (entryId) {
                pathname += entryId;
            }

            if (!location.pathname.includes(entryId)) {
                router.replace({pathname});
            }
        }

        if (error) {
            if (error.response && error.response.status) {
                error.code = String(error.response.status);
            }
        }

        dispatch(receiveWidget({data, error}));
        dispatch(setWidgetLoadStatus({isLoading: Boolean(needToProgressLoading)}));
    };
}

interface ReceiveWidgetAction {
    type: typeof RECEIVE_WIDGET;
    data: WidgetData;
    error?: AxiosError;
}

type ReceiveWidgetArgs = {
    data: WidgetData;
    error?: AxiosError;
};

export function receiveWidget({data, error}: ReceiveWidgetArgs): ReceiveWidgetAction {
    return {
        type: RECEIVE_WIDGET,
        data,
        error,
    };
}

interface SetExtraSettingsAction {
    type: typeof SET_EXTRA_SETTINGS;
    extraSettings: Shared['extraSettings'];
}

export function setExtraSettings(extraSettings: Shared['extraSettings']): SetExtraSettingsAction {
    return {
        type: SET_EXTRA_SETTINGS,
        extraSettings,
    };
}

export function onSuccessWizardWidgetUpdate(data: WidgetData) {
    return (dispatch: WizardDispatch) => {
        dispatch(receiveWidgetAndPrepareMetadata({data, isWidgetWasSaved: true}));
    };
}

export function onErrorWizardWidgetUpdate(error: AxiosError) {
    return (dispatch: WizardDispatch) => {
        dispatch(receiveWidgetAndPrepareMetadata({error}));
    };
}

export type UpdateWizardWidgetArgs = {
    entry: WidgetData;
    config: {shared: ClientChartsConfig} | undefined;
    mode?: EntryUpdateMode;
    annotation?: EntryAnnotationArgs;
};

export function updateWizardWidget(args: UpdateWizardWidgetArgs) {
    return async (dispatch: WizardDispatch) => {
        const {config, entry, mode, annotation} = args;

        const data = mapClientConfigToChartsConfig(config);

        const saveWidgetArgs: SaveWidgetArgs<ChartsConfig, WidgetData> = {
            data,
            entry,
            mode,
            annotation,
            onSuccess: (responseData) => dispatch(onSuccessWizardWidgetUpdate(responseData)),
            onError: (error) => dispatch(onErrorWizardWidgetUpdate(error)),
        };

        await dispatch(saveWidget(saveWidgetArgs));
    };
}

export function updateWizardWidgetAndUpdateConfig(args: UpdateWizardWidgetArgs) {
    return async function (dispatch: WizardDispatch) {
        await dispatch(updateWizardWidget(args));

        dispatch(
            updateClientChartsConfig({
                isInitialPreview: true,
                withoutRerender: true,
            }),
        );
    };
}

export type SetWidgetLoadStatusAction = {
    type: typeof SET_WIDGET_LOAD_STATUS;
    isLoading: boolean;
};

export type SetWidgetLoadStatusArgs = {
    isLoading: boolean;
};

export function setWidgetLoadStatus({
    isLoading,
}: SetWidgetLoadStatusArgs): SetWidgetLoadStatusAction {
    return {
        type: SET_WIDGET_LOAD_STATUS,
        isLoading,
    };
}

export type WidgetAction =
    | ReceiveWidgetAction
    | SetExtraSettingsAction
    | SetWidgetLoadStatusAction
    | SetWizardWidgetKeyAction;

// Now this action is called only if we use multi-datasets.
// The backend pivot tables don't know how to work with them, so we turn ont the old pivot tables.
export function forceEnablePivotFallback() {
    return function (dispatch: WizardDispatch, getState: () => DatalensGlobalState) {
        const wizardState = getState().wizard;

        const previewState = wizardState.preview;

        const extraSettings: CommonSharedExtraSettings = previewState.extraSettings || {};
        const pivotFallback = extraSettings.pivotFallback;

        if (!pivotFallback || pivotFallback === CHART_SETTINGS.PIVOT_FALLBACK.OFF) {
            dispatch(
                setExtraSettings({
                    ...extraSettings,
                    pivotFallback: CHART_SETTINGS.PIVOT_FALLBACK.ON as 'on',
                }),
            );
        }
    };
}

export function forceDisableTotalsAndPagination() {
    return function (dispatch: WizardDispatch, getState: () => DatalensGlobalState) {
        const wizardState = getState().wizard;

        const previewState = wizardState.preview;

        const extraSettings: CommonSharedExtraSettings = previewState.extraSettings || {};

        dispatch(
            setExtraSettings({
                ...extraSettings,
                totals: CHART_SETTINGS.TOTALS.OFF as 'off',
                pagination: CHART_SETTINGS.PAGINATION.OFF as 'off',
            }),
        );
    };
}

export type SetWizardWidgetKeyAction = {
    type: typeof SET_WIDGET_KEY;
    payload: string;
};

export function setWizardWidgetKey(
    key: SetWizardWidgetKeyAction['payload'],
): SetWizardWidgetKeyAction {
    return {
        type: SET_WIDGET_KEY,
        payload: key,
    };
}
