import React from 'react';

import type {PopupPlacement} from '@gravity-ui/uikit';
import {Icon, Popover} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import alertIcon from '../../../../../assets/icons/alert.svg';

import './AlertTooltip.scss';

const b = block('dl-dialog-public-alert-tooltip');
const defaultTooltipPlacement: PopupPlacement = ['left', 'bottom', 'top'];

type Props = {
    className?: string;
    text: string;
    tooltipPlacement?: PopupPlacement;
};

function AlertTooltip({className, text, tooltipPlacement}: Props) {
    const placement = tooltipPlacement || defaultTooltipPlacement;

    return (
        <div className={b(null, className)}>
            <Popover content={text} placement={placement}>
                <Icon data={alertIcon} width={20} height={20} className={b('icon')} />
            </Popover>
        </div>
    );
}

export default AlertTooltip;
