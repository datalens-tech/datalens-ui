import React from 'react';

import {HelpPopover} from '@gravity-ui/components';
import type {PopupPlacement} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './TitleWithTooltip.scss';

type TitleWithTooltipProps = {
    title: string;
    text: string | JSX.Element;
    tooltipTitle?: string;
    placement?: PopupPlacement;
    titleClassName?: string;
};

const b = block('title-with-tooltip');

export const TitleWithTooltip: React.FC<TitleWithTooltipProps> = ({
    title,
    tooltipTitle,
    text,
    placement,
    titleClassName,
}: TitleWithTooltipProps) => {
    return (
        <div className={b()}>
            <span className={b('title', titleClassName)}>{title}</span>
            <HelpPopover title={tooltipTitle} content={text} placement={placement || 'right'} />
        </div>
    );
};
