import React from 'react';

import {Popup} from '@gravity-ui/uikit';
import type {PopupPlacement} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {generateHtml} from '../../../modules/html-generator';

import './ChartKitTooltip.scss';

const b = block('chartkit-dl-tooltip');

export type ChartKitTooltipRef = {
    checkForTooltipNode: (e: MouseEvent) => void;
};

type ChartKitTooltipAnchor = {
    ref: {current: HTMLElement};
    content: string;
    placement?: PopupPlacement;
};

const getTooltipContent = (value = '') => {
    let result = value;
    let json: Parameters<typeof generateHtml>[0];

    try {
        json = JSON.parse(value);
    } catch {}

    if (json) {
        result = generateHtml(json);
    }

    return result;
};

const getTooltipPlacement = (value = '') => {
    let result = value;

    try {
        result = JSON.parse(value);
    } catch {}

    return result ? (result as PopupPlacement) : undefined;
};

const ChartKitTooltipComponent = React.forwardRef<ChartKitTooltipRef | undefined, {}>(
    function ChartKitTooltip(_props, ref) {
        const [anchor, setAnchor] = React.useState<ChartKitTooltipAnchor | null>(null);

        React.useImperativeHandle(
            ref,
            () => ({
                checkForTooltipNode(e) {
                    const node = e.target as HTMLElement | null;

                    if (!node) {
                        return;
                    }

                    const id = node.id;
                    const rawContent = node.dataset['tooltipContent'];
                    const currentId = anchor?.ref.current.id;

                    if (id && rawContent && currentId !== id) {
                        setAnchor({
                            ref: {current: node},
                            content: getTooltipContent(rawContent),
                            placement: getTooltipPlacement(node.dataset['tooltipPlacement']),
                        });
                    } else if (anchor !== null && currentId !== id) {
                        setAnchor(null);
                    }
                },
            }),
            [anchor],
        );

        React.useEffect(() => {
            // force Popover to recalculate its position after changing the content
            window.dispatchEvent(new CustomEvent('scroll'));
        });

        if (!anchor) {
            return null;
        }

        return (
            <Popup
                key={anchor.ref.current.id}
                anchorRef={anchor.ref}
                placement={anchor.placement}
                open={true}
                hasArrow={true}
            >
                <div className={b()} dangerouslySetInnerHTML={{__html: anchor.content}} />
            </Popup>
        );
    },
);

export const ChartKitTooltip = React.memo(ChartKitTooltipComponent);
