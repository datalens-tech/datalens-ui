import React from 'react';

import {TriangleExclamationFill} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import {DL} from 'ui/constants/common';
import type {ChartKitCustomError} from 'ui/libs/DatalensChartkit/ChartKit/modules/chartkit-custom-error/chartkit-custom-error';
import {closeDialog, openDialogErrorWithTabs} from 'ui/store/actions/dialog';

import type {ErrorData} from '../types';
import {prepareSelectorError} from '../utils';

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
    const hideErrorDetails = errorData?.extra?.hideErrorDetails;

    const errorText = errorTitle || i18n('label_error');

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

    const renderErrorContent = () => {
        return (
            <div className={b({mobile: DL.IS_MOBILE, 'no-action': hideErrorDetails})}>
                <span className={b('label')}>{errorText}</span>
                <Icon data={TriangleExclamationFill} className={b('icon')} />
            </div>
        );
    };

    return (
        <React.Fragment>
            {hideErrorDetails ? (
                <div title={errorText}>{renderErrorContent()}</div>
            ) : (
                <Button onClick={handleClick} title={errorText} view="flat">
                    {renderErrorContent()}
                </Button>
            )}
        </React.Fragment>
    );
}
