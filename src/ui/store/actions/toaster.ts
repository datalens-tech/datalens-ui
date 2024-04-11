import React from 'react';
import {AnyAction} from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {Toaster, ToastTheme, ToastAction} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {DatalensGlobalState, Utils} from '../../';
import {DataLensApiError} from '../../typings';
import {openDialogErrorWithTabs} from './dialog';
import {Feature} from 'shared';

const i18n = I18n.keyset('component.toaster.view');
const toaster = new Toaster();

export type ShowToastOptions = {
    title: string;
    type?: ToastTheme;
    error?: DataLensApiError;
    name?: string;
    content?: React.ReactNode;
    withReport?: boolean;
};

export const showToast = (opt: ShowToastOptions) => {
    return (dispatch: ThunkDispatch<DatalensGlobalState, void, AnyAction>) => {
        if (Utils.isEnabledFeature(Feature.ReadOnlyMode)) {
            return;
        }

        const {title, error, withReport, content} = opt;
        let actions: ToastAction[] | undefined;
        let type: ShowToastOptions['type'] = opt.type || 'info';

        if (error) {
            type = 'danger';
            actions = [
                {
                    label: i18n('label_details'),
                    onClick() {
                        dispatch(openDialogErrorWithTabs({title, error, withReport}));
                    },
                },
            ];
        }

        const titleStr = title.replace(/\s/g, '');
        const name = opt.name || `toast-${type || 'success'}-store-${titleStr}`;

        toaster.add({
            name,
            title,
            theme: type,
            actions,
            content,
        });
    };
};
