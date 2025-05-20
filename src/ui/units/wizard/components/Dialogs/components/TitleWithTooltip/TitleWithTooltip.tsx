import React from 'react';

import {HelpMark} from '@gravity-ui/uikit';
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
            <HelpMark
                popoverProps={{
                    title: tooltipTitle,
                    content: text,
                    placement: placement || 'right',
                }}
            />
        </div>
    );
};
