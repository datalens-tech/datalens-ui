import React from 'react';

import {Xmark} from '@gravity-ui/icons';
import {Icon, Popover, PopoverInstanceProps, useMobile} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {Action} from '../../store';

import alarmIcon from '../../../../../assets/icons/toast-attention.svg';

const b = block('yc-range-datepicker');

interface ActionsProps {
    dispatch: React.Dispatch<Action>;
    errorMessage?: string;
    showClear?: boolean;
}

export const Actions: React.FC<ActionsProps> = ({errorMessage, showClear, dispatch}) => {
    const mobile = useMobile();
    const alarmIconRef = React.useRef<HTMLSpanElement>(null);
    const tooltipRef = React.useRef<PopoverInstanceProps>(null);

    const onClearMouseEnter = React.useCallback(() => {
        dispatch({type: 'SET_CLEAR_HOVERED', payload: {clearHovered: true}});
    }, [dispatch]);

    const onClearMouseLeave = React.useCallback(() => {
        dispatch({type: 'SET_CLEAR_HOVERED', payload: {clearHovered: false}});
    }, [dispatch]);

    const onClearClick: React.MouseEventHandler<HTMLSpanElement> = React.useCallback(
        (e) => {
            e.stopPropagation();

            dispatch({
                type: 'SET_FROM_TO',
                payload: {
                    selectedFrom: undefined,
                    selectedTo: undefined,
                    errors: [],
                    callOnUpdate: true,
                },
            });
        },
        [dispatch],
    );

    return (
        <div className={b('control-actions')}>
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
                    className={b('control-action', {mobile, clear: true})}
                    onClick={onClearClick}
                    onMouseEnter={mobile ? undefined : onClearMouseEnter}
                    onMouseLeave={mobile ? undefined : onClearMouseLeave}
                >
                    <Icon data={Xmark} />
                </span>
            )}
            <Popover
                tooltipContentClassName={b('control-action-tooltip')}
                ref={tooltipRef}
                anchorRef={alarmIconRef}
                content={errorMessage}
                placement={['bottom', 'top']}
                hasArrow={false}
            />
        </div>
    );
};
