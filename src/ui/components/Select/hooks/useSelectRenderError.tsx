import React from 'react';

import {Button, Flex} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {ManualError} from 'ui/utils/errors/manual';

import '../styles/SelectUtil.scss';

const b = block('select-empty-options');
const bText = block('select-error-text');
const i18n = I18n.keyset('component.view-error.view');

export type UseSelectRenderErrorProps = {
    error?: string | ManualError;
    onRetry?: () => void;
};

export const useSelectRenderError = ({error, onRetry}: UseSelectRenderErrorProps) => {
    const renderEmptyOptions = React.useCallback(
        () => (
            <Flex direction={'column'} alignItems="flex-start" gap={2} className={b()}>
                {typeof error === 'string' ? (
                    error
                ) : (
                    <React.Fragment>
                        <div className={bText()}>{error?.status}</div>
                        <div className={bText()}>{error?.code || error?.details?.title}</div>
                        <div className={bText()}>
                            {error?.message || error?.details?.description}
                        </div>
                    </React.Fragment>
                )}
                {typeof onRetry === 'function' && (
                    <Button className={b('btn-retry')} onClick={() => onRetry?.()}>
                        {i18n('button_retry')}
                    </Button>
                )}
            </Flex>
        ),
        [error, onRetry],
    );
    return {renderEmptyOptions: error ? renderEmptyOptions : undefined};
};
