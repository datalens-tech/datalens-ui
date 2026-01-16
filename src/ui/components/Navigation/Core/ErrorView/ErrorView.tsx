import React from 'react';

import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {DataLensApiError} from 'typings';
import {PlaceholderIllustration} from 'ui/components/PlaceholderIllustration/PlaceholderIllustration';
import type {PlaceholderIllustrationProps} from 'ui/components/PlaceholderIllustration/types';
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

    let errorViewConfig: PlaceholderIllustrationProps;

    switch (status) {
        case 403: {
            errorViewConfig = {
                title: i18n('label_access-denied-folder'),
                name: 'noAccess',
            };
            break;
        }
        default: {
            errorViewConfig = {
                title: i18n('label_failed-load-navigation'),
                name: 'error',
                renderAction: () => (
                    <Button
                        view="action"
                        size="l"
                        className={b('button-retry')}
                        onClick={onRetryClick}
                    >
                        {i18n('button_retry')}
                    </Button>
                ),
            };
        }
    }

    return (
        <div className={b()}>
            <PlaceholderIllustration {...errorViewConfig} size="promo" direction="column" />
        </div>
    );
}
