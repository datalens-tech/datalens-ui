import React from 'react';

import {Popup, useVirtualElementRef} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import type {PointPosition} from '../../types';

import './Tooltip.scss';

const b = block('advanced-chart-tooltip');

type TooltipProps = {
    content?: string | null;
    pointerPosition?: PointPosition;
    widgetContainer?: HTMLDivElement | null;
};

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>((props, ref) => {
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
            open={true}
            anchorElement={anchorRef.current}
            offset={{mainAxis: 10, crossAxis: 0}}
            placement={['right-end', 'left', 'top', 'bottom']}
            floatingRef={ref}
        >
            <div
                className={b('content')}
                dangerouslySetInnerHTML={{
                    __html: content,
                }}
            ></div>
        </Popup>
    ) : null;
});

Tooltip.displayName = 'Tooltip';
