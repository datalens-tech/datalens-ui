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
    hideDelay: number;
    openDelay: number;
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

const createAnchor = (node: HTMLElement): ChartKitTooltipAnchor => {
    return {
        ref: {current: node},
        content: getTooltipContent(node.dataset['tooltipContent']),
        openDelay: Number(node.dataset['tooltipOpenDelay']) || 0,
        hideDelay: Number(node.dataset['tooltipHideDelay']) || 0,
        placement: getTooltipPlacement(node.dataset['tooltipPlacement']),
    };
};

const ChartKitTooltipComponent = React.forwardRef<ChartKitTooltipRef | undefined, {}>(
    function ChartKitTooltip(_props, ref) {
        const [anchor, setAnchor] = React.useState<ChartKitTooltipAnchor | null>(null);
        const [hover, setHover] = React.useState(false);
        const [open, setOpen] = React.useState(false);
        const timeoutIdRef = React.useRef<number | null>(null);

        const setOpenAsync = React.useCallback((nextOpen: boolean, delay: number) => {
            if (timeoutIdRef.current) {
                window.clearTimeout(timeoutIdRef.current);
            }

            timeoutIdRef.current = window.setTimeout(() => {
                setOpen(nextOpen);

                if (!nextOpen) {
                    setHover(false);
                }
            }, delay);
        }, []);

        React.useImperativeHandle(
            ref,
            () => ({
                checkForTooltipNode(e) {
                    if (hover) {
                        return;
                    }

                    let node = e.target as HTMLElement | null;

                    if (!node) {
                        return;
                    }

                    const anchorId = node.dataset['tooltipAnchorId'];

                    if (anchorId) {
                        node = document.getElementById(anchorId) || node;
                    }

                    const id = node.id;
                    const hasRawContent = Boolean(node.dataset['tooltipContent']);
                    const currentId = anchor?.ref.current.id;

                    if (id && hasRawContent && currentId !== id) {
                        const nextAnchor = createAnchor(node);
                        setAnchor(nextAnchor);
                        setOpenAsync(true, nextAnchor.openDelay);
                    } else if (anchor !== null && currentId !== id) {
                        setOpenAsync(false, anchor.hideDelay);
                    }
                },
            }),
            [anchor, hover, setAnchor, setOpenAsync],
        );

        React.useEffect(() => {
            // force Popover to recalculate its position after changing the content
            window.dispatchEvent(new CustomEvent('scroll'));
        });

        React.useEffect(() => {
            return () => {
                if (timeoutIdRef.current) {
                    window.clearTimeout(timeoutIdRef.current);
                }
            };
        }, []);

        return (
            <Popup
                key={anchor?.ref.current.id}
                anchorRef={anchor?.ref}
                placement={anchor?.placement}
                open={open}
                hasArrow={true}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => {
                    setHover(false);
                    if (anchor) {
                        setOpenAsync(false, anchor.hideDelay);
                    }
                }}
                onTransitionExited={() => setAnchor(null)}
            >
                <div className={b()} dangerouslySetInnerHTML={{__html: anchor?.content || ''}} />
            </Popup>
        );
    },
);

export const ChartKitTooltip = React.memo(ChartKitTooltipComponent);
