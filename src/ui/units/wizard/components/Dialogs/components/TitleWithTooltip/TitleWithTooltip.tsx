import React from 'react';

import {HelpMark} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './TitleWithTooltip.scss';

type TitleWithTooltipProps = {
    title: string;
    text: string | JSX.Element;
};

const b = block('title-with-tooltip');

export const TitleWithTooltip: React.FC<TitleWithTooltipProps> = ({
    title,
    text,
}: TitleWithTooltipProps) => {
    return (
        <div className={b()}>
            <span className={b('title')}>{title}</span>
            <HelpMark
                popoverProps={{
                    placement: 'right',
                }}
            >
                <div className={b('tooltip-content')}>{text}</div>
            </HelpMark>
        </div>
    );
};
