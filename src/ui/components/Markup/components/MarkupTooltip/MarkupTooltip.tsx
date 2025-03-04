import React from 'react';

import {Popup} from '@gravity-ui/uikit';
import type {PopupPlacement} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import type {TemplateItem} from '../../types';

import './MarkupTooltip.scss';

const b = block('dl-markup');

const DEFAULT_OPEN_DELAY = 100;

type Props = {
    content: React.ReactNode;
    children?: (string | TemplateItem)[];
    placement?: string;
};

export function MarkupTooltip(props: Props) {
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef<HTMLSpanElement>(null);
    const timeoutIdRef = React.useRef<number | null>(null);

    const setOpenAsync = React.useCallback((nextOpen: boolean, delay: number) => {
        if (timeoutIdRef.current) {
            window.clearTimeout(timeoutIdRef.current);
        }

        timeoutIdRef.current = window.setTimeout(() => {
            setOpen(nextOpen);
        }, delay);
    }, []);

    const handleMouseEnter = () => {
        setOpenAsync(true, DEFAULT_OPEN_DELAY);
    };

    const handleMouseLeave = () => {
        setOpenAsync(false, DEFAULT_OPEN_DELAY);
    };

    return (
        <React.Fragment>
            <span ref={ref} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {props.children}
                <Popup
                    anchorRef={ref}
                    className={b()}
                    contentClassName={b('content')}
                    hasArrow={true}
                    open={open}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    placement={props.placement as PopupPlacement}
                >
                    {props.content}
                </Popup>
            </span>
        </React.Fragment>
    );
}
