import {AxiosError} from 'axios';
import {batch} from 'react-redux';
import {ClientChartsConfig} from 'shared';
import {DatalensGlobalState} from 'ui';

import {setActualChart} from '../../../../store/actions/chartWidget';
import {setEntryContent, setRevisionsMode} from '../../../../store/actions/entryContent';
import {RevisionsMode} from '../../../../store/typings/entryContent';
import {SetDefaultsArgs, resetWizardStore, setDefaults} from '../../actions';
import {
    onErrorWizardWidgetUpdate,
    onSuccessWizardWidgetUpdate,
    receiveWidget,
} from '../../actions/widget';
import {mapClientConfigToChartsConfig} from '../../utils/mappers/mapClientToChartsConfig';
import {WizardDispatch} from '../index';

export function onSuccessSetActualWizardChart() {
    return async (dispatch: WizardDispatch, getState: () => DatalensGlobalState) => {
        const newWidget = getState().wizard.widget.widget;
        if (newWidget) {
            await dispatch(setEntryContent(newWidget));
        } else {
            await dispatch(setRevisionsMode(RevisionsMode.Closed));
        }
    };
}

export function onErrorSetActualWizardChart(error: AxiosError) {
    return (dispatch: WizardDispatch) => {
        dispatch(receiveWidget({data: null, error}));
    };
}

export function setActualWizardChart(isDraftEntry?: boolean) {
    return async (dispatch: WizardDispatch, getState: () => DatalensGlobalState) => {
        const state = getState();

        const configForSaving = state.wizard.widget.widget.data;
        const entry = state.wizard?.widget?.widget || {};

        const data = mapClientConfigToChartsConfig({shared: configForSaving}) as ClientChartsConfig;

        await dispatch(
            setActualChart({
                data,
                entry,
                isDraftEntry,
                onRequestSuccess: (responseData) =>
                    dispatch(onSuccessWizardWidgetUpdate(responseData)),
                onRequestError: (error) => dispatch(onErrorWizardWidgetUpdate(error)),
                onSetActualSuccess: () => dispatch(onSuccessSetActualWizardChart()),
                onSetActualError: (error) => dispatch(onErrorSetActualWizardChart(error)),
            }),
        );

        return null;
    };
}

export function reloadWizardEntryByRevision(params: SetDefaultsArgs) {
    return (dispatch: WizardDispatch) => {
        batch(() => {
            dispatch(resetWizardStore());
            dispatch(setDefaults(params));
        });
    };
}
