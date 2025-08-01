import React from 'react';

import {
    safePolygon,
    useClick,
    useDismiss,
    useFloatingRootContext,
    useHover,
    useRole,
} from '@floating-ui/react';
import {Popup} from '@gravity-ui/uikit';
import type {PopupPlacement} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {isMarkupItem} from '../../../../../../shared';
import {getRenderMarkupToStringFn} from '../../../../../utils/markup';
import {generateHtml} from '../../../modules/html-generator';
import {
    ATTR_DATA_TOOLTIP_ANCHOR_ID,
    ATTR_DATA_TOOLTIP_CONTENT,
} from '../../../modules/html-generator/constants';
import {getParseHtmlFn} from '../../../modules/html-generator/utils';

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

const getTooltipContent = async (value = '') => {
    let result = value;
    let json;

    try {
        json = JSON.parse(value);

        if (typeof json === 'string') {
            const parseHtml = await getParseHtmlFn();
            json = parseHtml(json);
        }
    } catch {}

    if (json) {
        if (isMarkupItem(json)) {
            const fn = await getRenderMarkupToStringFn();
            result = fn(json);
        } else {
            result = generateHtml(json, {ignoreInvalidValues: true});
        }
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

const createAnchor = async (node: HTMLElement): Promise<ChartKitTooltipAnchor> => {
    return {
        ref: {current: node},
        content: await getTooltipContent(node.dataset['tooltipContent']),
        openDelay: Number(node.dataset['tooltipOpenDelay']) || 0,
        hideDelay: Number(node.dataset['tooltipHideDelay']) || 0,
        placement: getTooltipPlacement(node.dataset['tooltipPlacement']),
    };
};

const ChartKitTooltipComponent = React.forwardRef<ChartKitTooltipRef | undefined, {}>(
    function ChartKitTooltip(_props, ref) {
        const [anchor, setAnchor] = React.useState<ChartKitTooltipAnchor | null>(null);
        const [open, setOpen] = React.useState(false);
        const timeoutIdRef = React.useRef<number | null>(null);

        const [floatingElement, setFloatingElement] = React.useState<HTMLDivElement | null>(null);
        const context = useFloatingRootContext({
            open: open,
            onOpenChange: setOpen,
            elements: {
                reference: anchor?.ref.current ?? null,
                floating: floatingElement,
            },
        });

        const hover = useHover(context, {
            enabled: true,
            delay: {open: anchor?.openDelay, close: anchor?.hideDelay},
            move: false,
            handleClose: safePolygon(),
        });
        const click = useClick(context);
        const role = useRole(context, {
            role: 'dialog',
        });
        const dismiss = useDismiss(context);
        const interactions = [hover, click, role, dismiss];

        const setOpenAsync = React.useCallback((nextOpen: boolean, delay: number) => {
            if (timeoutIdRef.current) {
                window.clearTimeout(timeoutIdRef.current);
            }

            timeoutIdRef.current = window.setTimeout(() => {
                setOpen(nextOpen);
            }, delay);
        }, []);

        React.useImperativeHandle(
            ref,
            () => ({
                async checkForTooltipNode(e) {
                    const eventTarget = e.target as HTMLElement;
                    let node = eventTarget?.closest(
                        `[${ATTR_DATA_TOOLTIP_CONTENT}],[${ATTR_DATA_TOOLTIP_ANCHOR_ID}]`,
                    ) as HTMLElement;

                    const anchorId = node.dataset['tooltipAnchorId'];

                    if (anchorId) {
                        node = document.getElementById(anchorId) || node;
                    }

                    const id = node.id;
                    const hasRawContent = Boolean(node.dataset['tooltipContent']);
                    const currentId = anchor?.ref.current.id;

                    if (id && hasRawContent && currentId !== id) {
                        const nextAnchor = await createAnchor(node);
                        setAnchor(nextAnchor);
                        setOpenAsync(true, nextAnchor.openDelay);
                    }
                },
            }),
            [anchor, setAnchor, setOpenAsync],
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
                anchorElement={anchor?.ref.current}
                placement={anchor?.placement}
                className={b('popup')}
                open={context.open}
                floatingContext={context}
                floatingRef={setFloatingElement}
                floatingInteractions={interactions}
                hasArrow={true}
            >
                <div className={b()} dangerouslySetInnerHTML={{__html: anchor?.content || ''}} />
            </Popup>
        );
    },
);

export const ChartKitTooltip = React.memo(ChartKitTooltipComponent);
