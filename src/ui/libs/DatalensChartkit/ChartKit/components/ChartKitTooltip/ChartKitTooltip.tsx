import React from 'react';

import {Popup} from '@gravity-ui/uikit';

import {generateHtml} from '../../../modules/html-generator';
import {ATTR_DATA_TOOLTIP_CONTENT} from '../../../modules/html-generator/constants';

export type ChartKitTooltipRef = {
    checkForTooltipNodes: (container: HTMLDivElement | null) => void;
};
type ChartKitTooltipProps = {};

type ChartKitTooltipState = {
    ref: {current: HTMLElement};
    content: string;
    open: boolean;
};
type TooltipAnchors = Record<string, ChartKitTooltipState>;

const getNodeIdFromMouseEvent = (e: MouseEvent) => {
    const id = (e.target && 'id' in e.target && e.target.id) as string | undefined;
    return id || '';
};

const getTooltipContent = (value = '') => {
    let result = value;

    try {
        const json = JSON.parse(value);
        result = generateHtml(json);
    } catch {}

    return result;
};

const ChartKitTooltipComponent = React.forwardRef<
    ChartKitTooltipRef | undefined,
    ChartKitTooltipProps
>(function ChartKitTooltip(_props, ref) {
    const [anchors, setAnchors] = React.useState<TooltipAnchors>({});
    const anchorsRef = React.useRef(anchors);

    const updateAnchors = React.useCallback((nextAnchors: TooltipAnchors) => {
        anchorsRef.current = nextAnchors;
        setAnchors(nextAnchors);
    }, []);

    const handleAnchorMouseEnter = React.useCallback(
        (e: MouseEvent) => {
            const nodeId = getNodeIdFromMouseEvent(e);

            if (!anchorsRef.current[nodeId]) {
                return;
            }

            const updatedAnchors = {...anchorsRef.current};
            Object.entries(updatedAnchors).forEach(([id, anchor]) => {
                anchor.open = id === nodeId;
            });

            updateAnchors(updatedAnchors);
        },
        [updateAnchors],
    );

    const handleAnchorMouseLeave = React.useCallback(
        (e: MouseEvent) => {
            const nodeId = getNodeIdFromMouseEvent(e);

            if (!anchorsRef.current[nodeId]) {
                return;
            }

            const updatedAnchors = {...anchorsRef.current};
            updatedAnchors[nodeId].open = false;
            updateAnchors(updatedAnchors);
        },
        [updateAnchors],
    );

    React.useImperativeHandle(
        ref,
        () => ({
            checkForTooltipNodes(container) {
                if (!container) {
                    return;
                }

                const nodes = Array.from(
                    container.querySelectorAll(`[${ATTR_DATA_TOOLTIP_CONTENT}]`),
                ) as HTMLElement[];
                const nextAnchors = nodes.reduce<TooltipAnchors>((acc, node) => {
                    const id = node.id;
                    const content = getTooltipContent(node.dataset['tooltipContent']);
                    if (id && content) {
                        acc[id] = {
                            ref: {current: node},
                            open: false,
                            content,
                        };
                        node.addEventListener('mouseenter', handleAnchorMouseEnter);
                        node.addEventListener('mouseleave', handleAnchorMouseLeave);
                    }
                    return acc;
                }, {});
                anchorsRef.current = nextAnchors;
                setAnchors(nextAnchors);
            },
        }),
        [handleAnchorMouseEnter, handleAnchorMouseLeave],
    );

    React.useEffect(() => {
        // force Popover to recalculate its position after changing the content
        window.dispatchEvent(new CustomEvent('scroll'));
    });

    if (!Object.keys(anchors).length) {
        return null;
    }

    return (
        <React.Fragment>
            {Object.entries(anchors).map(([id, anchor]) => {
                return (
                    <Popup key={id} anchorRef={anchor.ref} open={anchor.open}>
                        <div dangerouslySetInnerHTML={{__html: anchor.content}} />
                    </Popup>
                );
            })}
        </React.Fragment>
    );
});

export const ChartKitTooltip = React.memo(ChartKitTooltipComponent);
