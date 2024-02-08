import React from 'react';

import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import {ChartKitCustomError} from 'ui/libs/DatalensChartkit/ChartKit/modules/chartkit-custom-error/chartkit-custom-error';
import {closeDialog, openDialogErrorWithTabs} from 'ui/store/actions/dialog';
import {isMobileView} from 'ui/utils/mobile';

import {ErrorData} from '../types';
import {prepareSelectorError} from '../utils';

import iconAlert from 'assets/icons/alert.svg';

import './Error.scss';

const b = block('dashkit-control-error');
const i18n = I18n.keyset('component.dashkit.view');

type ErrorProps = {
    onClickRetry?: () => void;
    errorData?: null | ErrorData;
};

export function Error({onClickRetry, errorData}: ErrorProps) {
    const dispatch = useDispatch();
    const errorTitle = errorData?.data?.title;

    const handleClick = () => {
        if (errorData) {
            dispatch(
                openDialogErrorWithTabs({
                    error: prepareSelectorError(
                        errorData?.data || {},
                        errorData?.requestId,
                    ) as ChartKitCustomError,
                    title: errorTitle,
                    onRetry: () => {
                        onClickRetry?.();
                        dispatch(closeDialog());
                    },
                }),
            );
        }
    };

    return (
        <div className={b('error')}>
            <div className={b({mobile: isMobileView})} onClick={handleClick}>
                <span className={b('label')}>{i18n('label_error')}</span>
                <Icon data={iconAlert} className={b('icon')} />
            </div>
        </div>
    );
}
