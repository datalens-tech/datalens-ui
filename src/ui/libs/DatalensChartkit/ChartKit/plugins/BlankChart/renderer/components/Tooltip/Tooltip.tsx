import React from 'react';

import {Popup, useVirtualElementRef} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import type {PointPosition} from '../../types';

import './Tooltip.scss';

const b = block('blank-chart-tooltip');

type TooltipProps = {
    content?: string | null;
    pointerPosition?: PointPosition;
    widgetContainer?: HTMLDivElement | null;
};

export const Tooltip = (props: TooltipProps) => {
    const {content, pointerPosition, widgetContainer} = props;

    const containerRect = widgetContainer?.getBoundingClientRect() || {left: 0, top: 0};
    const left = (pointerPosition?.[0] || 0) + containerRect.left;
    const top = (pointerPosition?.[1] || 0) + containerRect.top;
    const anchorRef = useVirtualElementRef({rect: {left, top}});

    React.useEffect(() => {
        window.dispatchEvent(new CustomEvent('scroll'));
    }, [left, top]);

    return content ? (
        <Popup
            className={b({})}
            contentClassName={b('popup-content')}
            open={true}
            anchorRef={anchorRef}
            offset={[0, 20]}
            placement={['right', 'left', 'top', 'bottom']}
            modifiers={[{name: 'preventOverflow', options: {padding: 10, altAxis: true}}]}
        >
            <div
                className={b('content')}
                dangerouslySetInnerHTML={{
                    __html: content,
                }}
            ></div>
        </Popup>
    ) : null;
};
