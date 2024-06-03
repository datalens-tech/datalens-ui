import React from 'react';

import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import {ErrorContentTypes} from 'shared';
import {openDialogErrorWithTabs} from 'store/actions/dialog';
import {ErrorContent, Utils} from 'ui';
import {MOBILE_SIZE, isMobileView} from 'ui/utils/mobile';

import type {DataLensApiError} from '../../typings';

import './ViewError.scss';

const b = block('dl-view-error');
const i18n = I18n.keyset('component.view-error.view');

export interface ViewErrorProps {
    retry?: () => void;
    error?: DataLensApiError | null;
    title?: string;
    description?: string;
    type?: string;
    className?: string;
    buttonText?: string;
    withReport?: boolean;
    actionContent?: React.ReactNode;
}

export const ViewError = ({
    retry,
    error,
    title,
    description,
    type,
    className,
    buttonText,
    withReport,
    actionContent,
}: ViewErrorProps) => {
    const dispatch = useDispatch();

    if (!error) {
        return null;
    }

    const {
        status,
        message,
    }: {
        status: number | null;
        message: string;
    } = Utils.parseErrorResponse(error);

    function getErrorMessage() {
        switch (status) {
            case 403:
                return {
                    type: ErrorContentTypes.NO_ACCESS,
                    title: i18n('label_access-error'),
                };
            case 404:
                return {
                    type: ErrorContentTypes.NOT_FOUND,
                    title: i18n('label_error'),
                };
            case 500:
            default:
                return {
                    type: ErrorContentTypes.ERROR,
                    title: i18n('label_error'),
                };
        }
    }

    const {type: statusType, title: statusTitle} = getErrorMessage();
    const resultType = type || statusType;
    const resultTitle = title || statusTitle;
    const errorClassname = className || 'actions';
    const buttonDetailsText = buttonText || i18n('button_details');

    const buttonSize = isMobileView ? MOBILE_SIZE.BUTTON : 'm';
    const buttonWidth = isMobileView ? 'max' : 'auto';

    const handleClickDetails = () => {
        dispatch(
            openDialogErrorWithTabs({
                title: resultTitle,
                error,
                withReport,
            }),
        );
    };

    const content = (
        <div className={b(errorClassname, {mobile: isMobileView})}>
            {typeof retry === 'function' && (
                <Button
                    className={b('btn-retry')}
                    size={buttonSize}
                    width={buttonWidth}
                    onClick={() => retry()}
                >
                    {i18n('button_retry')}
                </Button>
            )}
            <Button
                className={b('btn-details')}
                size={buttonSize}
                width={buttonWidth}
                view="outlined"
                onClick={handleClickDetails}
            >
                {buttonDetailsText}
            </Button>
            {actionContent}
        </div>
    );

    return (
        <ErrorContent
            type={resultType}
            title={resultTitle}
            description={description || message}
            action={{content}}
            error={error}
        />
    );
};

export default ViewError;
