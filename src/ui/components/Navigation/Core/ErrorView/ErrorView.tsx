import React from 'react';

import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {DataLensApiError} from 'typings';
import {parseError} from 'utils/errors/parse';

import './ErrorView.scss';

const b = block('dl-core-navigation-error');
const i18n = I18n.keyset('component.navigation.view');

type Props = {
    error: DataLensApiError;
    onRetryClick: () => void;
};

export default function ErrorView({error, onRetryClick}: Props) {
    const {status} = parseError(error);

    let text;
    let hasButton = true;

    switch (status) {
        case 403: {
            text = i18n('label_access-denied-folder');
            hasButton = false;
            break;
        }
        default:
            text = i18n('label_failed-load-navigation');
    }

    return (
        <div className={b()}>
            <div className={b('message')}>{text}</div>
            {hasButton && (
                <Button view="action" size="l" onClick={onRetryClick}>
                    {i18n('button_retry')}
                </Button>
            )}
        </div>
    );
}
