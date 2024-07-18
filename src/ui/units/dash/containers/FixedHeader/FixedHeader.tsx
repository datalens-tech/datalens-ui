import React from 'react';

import block from 'bem-cn-lite';

import './FixedHeader.scss';

type FixedHeaderContainerProps = {
    isEmpty: boolean;
    isCollapsed: boolean;
    editMode: boolean;
};

type FixedHeaderControlsProps = FixedHeaderContainerProps & {
    controls: React.ReactNode;
};

const b = block('dash-fixed-header');

const CONTROLS_TOP_OFFSET = 40;
const CONTAINER_TOP_OFFSET = CONTROLS_TOP_OFFSET + 60;

const CONTAINER_PADDING_OFFSET = 48;

const useFixedHeaderRef = (rootRef: React.RefObject<HTMLDivElement>, topOffset = 0) => {
    const [isFixed, setIsFixed] = React.useState(false);
    const [leftOffset, setLeftOffset] = React.useState(0);
    const [width, setWidth] = React.useState<number | string>(0);

    React.useEffect(() => {
        const handler = () => {
            const rect = rootRef.current?.getBoundingClientRect();

            setIsFixed(rect ? rect.top <= topOffset : false);
            setLeftOffset(rect?.left || 0);
        };

        const resizeObserver = new ResizeObserver(() => {
            const rect = rootRef.current?.getBoundingClientRect();

            setWidth(rect?.width ? rect.width + CONTAINER_PADDING_OFFSET : '100%');
            setLeftOffset(rect?.left || 0);
        });

        window.document?.addEventListener('scroll', handler);

        if (rootRef.current) {
            resizeObserver.observe(rootRef.current);
        }

        handler();

        return () => {
            window.document?.removeEventListener('scroll', handler);
            resizeObserver.disconnect();
        };
    }, [rootRef, topOffset]);

    return {isFixed, leftOffset, width};
};

export const FixedHeaderControls: React.FC<FixedHeaderControlsProps> = (props) => {
    const rootRef = React.useRef<HTMLDivElement>(null);
    const {editMode, isEmpty} = props;
    const {isFixed, leftOffset, width} = useFixedHeaderRef(rootRef, CONTROLS_TOP_OFFSET);

    const children = !editMode && isEmpty ? null : props.children;
    const style = isFixed && !editMode ? {left: leftOffset, width} : {};

    return (
        <div ref={rootRef} className={b('controls-placeholder')}>
            <div
                style={style}
                className={b('controls', {
                    fixed: isFixed && !editMode,
                    'edit-mode': editMode,
                })}
            >
                <div className={b('controls-grid')}>{children}</div>
                <div className={b('controls-settings')}>{props.controls}</div>
            </div>
        </div>
    );
};

export const FixedHeaderContainer: React.FC<FixedHeaderContainerProps> = (props) => {
    const {editMode, isEmpty} = props;
    const rootRef = React.useRef<HTMLDivElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const [containerHeight, setContainerHeight] = React.useState(0);

    const isRenderEmpty = !editMode && isEmpty;

    React.useEffect(() => {
        if (isRenderEmpty) {
            setContainerHeight(0);
            return;
        }

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
    }, [containerRef, isRenderEmpty]);

    const {isFixed, leftOffset, width} = useFixedHeaderRef(rootRef, CONTAINER_TOP_OFFSET);
    const style = isFixed && !editMode ? {left: leftOffset, width} : {};

    return (
        <div ref={rootRef} className={b('container-placeholder')} style={{height: containerHeight}}>
            <div
                ref={containerRef}
                style={style}
                className={b('container', {
                    fixed: isFixed && !editMode,
                    collapsed: (!editMode && props.isCollapsed) || isRenderEmpty,
                    'edit-mode': editMode,
                })}
            >
                <div className={b('container-wrapper')}>{props.children}</div>
            </div>
        </div>
    );
};
