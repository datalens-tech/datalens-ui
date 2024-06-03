import React from 'react';

import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';

import {openDialogErrorWithTabs} from '../../../../../store/actions/dialog';
import type {DataLensApiError} from '../../../../../typings';
import {PlainText} from '../components';

import './ErrorActions.scss';

const i18n = I18n.keyset('connections.form');
const b = block('conn-form-error-actions');

interface ErrorActionsProps {
    onRetry: () => void;
    error: DataLensApiError;
    message: string;
}

export const ErrorActions = ({error, message, onRetry}: ErrorActionsProps) => {
    const dispatch = useDispatch();

    const detailsClickHandler = () => {
        dispatch(openDialogErrorWithTabs({title: message, error}));
    };

    return (
        <React.Fragment>
            <PlainText className={b('text')} text={message} />
            <Button view="outlined" onClick={detailsClickHandler}>
                {i18n('button_details')}
            </Button>
            <Button onClick={onRetry}>{i18n('button_retry')}</Button>
        </React.Fragment>
    );
};
