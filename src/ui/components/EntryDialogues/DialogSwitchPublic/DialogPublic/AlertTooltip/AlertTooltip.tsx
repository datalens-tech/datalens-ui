import React from 'react';

import {TriangleExclamation} from '@gravity-ui/icons';
import type {PopupPlacement} from '@gravity-ui/uikit';
import {Icon, Popover} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

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
                <Icon data={TriangleExclamation} className={b('icon')} />
            </Popover>
        </div>
    );
}

export default AlertTooltip;
