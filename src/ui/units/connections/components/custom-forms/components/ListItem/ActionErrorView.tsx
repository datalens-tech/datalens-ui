import React from 'react';

import type {PopoverInstanceProps, PopupPlacement} from '@gravity-ui/uikit';
import {Button, Icon, Popover} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import type {ActionError} from './types';

import iconAlert from '../../../../../../assets/icons/alert.svg';

const b = block('conn-list-item');
const i18n = I18n.keyset('connections.file.view');
const ICON_SIZE = 18;
const POPOVER_PLACEMENT: PopupPlacement = ['bottom', 'top'];

type ActionErrorViewProps<T = unknown> = Omit<ActionError<T>, 'type'>;

export const ActionErrorView = <T extends unknown>({
    item,
    message,
    onClick,
}: ActionErrorViewProps<T>) => {
    const ref = React.createRef<PopoverInstanceProps>();
    const showAction = Boolean(onClick);

    const handleRetryUpload = React.useCallback(() => {
        onClick?.(item);
        ref.current?.closeTooltip();
    }, [ref, item, onClick]);

    const content = React.useMemo(() => {
        return (
            <div onClick={(e) => e?.stopPropagation()}>
                <span>{message}</span>
                {showAction && (
                    <Button onClick={handleRetryUpload}>{i18n('button_retry-download')}</Button>
                )}
            </div>
        );
    }, [message, showAction, handleRetryUpload]);

    return (
        <Popover
            ref={ref}
            floatingClassName={b('alert')}
            className={b('alert-tooltip')}
            contentClassName={b('alert-tooltip-content')}
            content={content}
            placement={POPOVER_PLACEMENT}
        >
            <Icon className={b('alert-icon')} data={iconAlert} size={ICON_SIZE} />
        </Popover>
    );
};
