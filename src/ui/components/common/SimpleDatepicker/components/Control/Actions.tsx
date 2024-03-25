import React from 'react';

import {Xmark} from '@gravity-ui/icons';
import {Icon, Popover, PopoverInstanceProps, useMobile} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {Action} from '../../store';

import alarmIcon from '../../../../../assets/icons/toast-attention.svg';

const b = block('dl-simple-datepicker');

interface ActionsProps {
    clear: () => void;
    dispatch: React.Dispatch<Action>;
    onClick?: () => void;
    errorMessage?: string;
    showClear?: boolean;
}

export const Actions: React.FC<ActionsProps> = ({
    errorMessage,
    showClear,
    clear,
    dispatch,
    onClick,
}) => {
    const mobile = useMobile();
    const alarmIconRef = React.useRef<HTMLSpanElement>(null);
    const tooltipRef = React.useRef<PopoverInstanceProps>(null);

    const onClearMouseEnter = React.useCallback(() => {
        dispatch({type: 'SET_CLEAR_HOVERED', payload: {clearHovered: true}});
    }, [dispatch]);

    const onClearMouseLeave = React.useCallback(() => {
        dispatch({type: 'SET_CLEAR_HOVERED', payload: {clearHovered: false}});
    }, [dispatch]);

    return (
        <div className={b('control-actions')} onClick={onClick}>
            <span
                ref={alarmIconRef}
                className={b('control-action', {hidden: !errorMessage})}
                onMouseEnter={tooltipRef.current?.openTooltip}
                onMouseLeave={tooltipRef.current?.closeTooltip}
            >
                <Icon data={alarmIcon} />
            </span>
            {showClear && (
                <span
                    className={b('control-action', {clear: true})}
                    onClick={clear}
                    onMouseEnter={mobile ? undefined : onClearMouseEnter}
                    onMouseLeave={mobile ? undefined : onClearMouseLeave}
                >
                    <Icon data={Xmark} />
                </span>
            )}
            <Popover
                tooltipClassName={b('control-action-tooltip', {mobile})}
                ref={tooltipRef}
                anchorRef={alarmIconRef}
                content={errorMessage}
                placement={['bottom', 'top']}
                hasArrow={false}
            />
        </div>
    );
};
