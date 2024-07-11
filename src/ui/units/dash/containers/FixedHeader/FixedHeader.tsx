import React from 'react';

import block from 'bem-cn-lite';

import './FixedHeader.scss';

type FixedHeaderContainerProps = {
    isCollapsed: boolean;
    editMode: boolean;
};

type FixedHeaderControlsProps = FixedHeaderContainerProps & {
    controls: React.ReactNode;
};

const b = block('dash-fixed-header');

const CONTROLS_TOP_OFFSET = 40;
const CONTAINER_TOP_OFFSET = CONTROLS_TOP_OFFSET + 60;

const useFixedHeaderRef = (
    rootRef: React.RefObject<HTMLDivElement>,
    topOffset = 0,
    updateHandler?: (domRect: DOMRect) => void,
) => {
    const [isFixed, setIsFixed] = React.useState(false);

    React.useEffect(() => {
        const handler = () => {
            const rect = rootRef.current?.getBoundingClientRect();

            if (rect) {
                setIsFixed(rect.top <= topOffset);
                updateHandler?.(rect);
            } else {
                setIsFixed(false);
            }
        };

        window.document?.addEventListener('scroll', handler);
        window.document?.addEventListener('resize', handler);
        handler();

        return () => {
            window.document?.removeEventListener('scroll', handler);
            window.document?.removeEventListener('resize', handler);
        };
    }, [rootRef, topOffset, updateHandler]);

    return {isFixed};
};

export const FixedHeaderControls: React.FC<FixedHeaderControlsProps> = (props) => {
    const rootRef = React.useRef<HTMLDivElement>(null);
    const {isFixed} = useFixedHeaderRef(rootRef, CONTROLS_TOP_OFFSET);

    return (
        <div ref={rootRef} className={b('controls-placeholder')}>
            <div
                className={b('controls', {
                    fixed: isFixed && !props.editMode,
                    'edit-mode': props.editMode,
                })}
            >
                <div className={b('controls-grid')}>{props.children}</div>
                <div className={b('controls-settings')}>{props.controls}</div>
            </div>
        </div>
    );
};

export const FixedHeaderContainer: React.FC<FixedHeaderContainerProps> = (props) => {
    const rootRef = React.useRef<HTMLDivElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const [containerHeight, setContainerHeight] = React.useState(0);

    React.useEffect(() => {
        const observer = new ResizeObserver(([el]) => {
            if (el) {
                const {height} = el.contentRect;
                setContainerHeight(height);
            }
        });

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [containerRef]);

    const {isFixed} = useFixedHeaderRef(rootRef, CONTAINER_TOP_OFFSET);

    return (
        <div ref={rootRef} className={b('container-placeholder')} style={{height: containerHeight}}>
            <div
                ref={containerRef}
                className={b('container', {
                    fixed: isFixed && !props.editMode,
                    collapsed: !props.editMode && props.isCollapsed,
                    'edit-mode': props.editMode,
                })}
            >
                <div className={b('container-wrapper')}>{props.children}</div>
            </div>
        </div>
    );
};
