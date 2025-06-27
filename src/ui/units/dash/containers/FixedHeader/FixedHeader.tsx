import React from 'react';

import {ChevronsUp} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {FixedHeaderQa} from 'shared';

import './FixedHeader.scss';

type CommonFixedHeaderProps = {
    editMode: boolean;
};

type FixedHeaderControlsProps = CommonFixedHeaderProps & {
    isEmpty: boolean;
    isContainerGroupEmpty: boolean;
    controls: React.ReactNode;
};

type FixedHeaderContainerProps = CommonFixedHeaderProps & {
    isEmpty: boolean;
    isControlsGroupEmpty: boolean;
};

const b = block('dash-fixed-header');
const i18n = I18n.keyset('dash.empty-state.view');

const calculateOffset = (dashBodyRef: React.RefObject<HTMLDivElement>) => {
    const pageBodyY = document.body.getBoundingClientRect().y;
    const dashBodyY = dashBodyRef.current?.getBoundingClientRect()?.y ?? pageBodyY;

    return dashBodyY - pageBodyY;
};

const EmptyPlaceholder = ({
    content,
    text,
    mod,
}: {
    content: React.ReactNode;
    text: React.ReactNode;
    mod?: string;
}) => (
    <React.Fragment>
        {content}
        <div className={b('empty', mod)}>{text}</div>
    </React.Fragment>
);

const useFixedHeaderRef = (rootRef: React.RefObject<HTMLDivElement>, topOffset = 0) => {
    const [isFixed, setIsFixed] = React.useState(false);
    const [leftOffset, setLeftOffset] = React.useState(0);
    const [width, setWidth] = React.useState<number | string>(0);

    React.useLayoutEffect(() => {
        const handler = () => {
            const rect = rootRef.current?.getBoundingClientRect();

            setIsFixed(rect ? rect.top <= topOffset : false);
            setLeftOffset(rect?.left || 0);
        };

        const resizeObserver = new ResizeObserver(() => {
            const rect = rootRef.current?.getBoundingClientRect();

            setWidth(rect?.width ? rect.width : '100%');
            setLeftOffset(rect?.left || 0);
        });

        window.document?.addEventListener('scroll', handler);

        if (rootRef.current) {
            resizeObserver.observe(rootRef.current);
        }

        setTimeout(handler);

        return () => {
            window.document?.removeEventListener('scroll', handler);
            resizeObserver.disconnect();
        };
    }, [rootRef, topOffset]);

    return {isFixed, leftOffset, width};
};

export const FixedHeaderControls: React.FC<FixedHeaderControlsProps> = ({
    isEmpty,
    isContainerGroupEmpty,
    editMode,
    controls,
    children: externalChildren,
}) => {
    const children = !editMode && isEmpty ? null : externalChildren;

    const content =
        isEmpty && editMode ? (
            <EmptyPlaceholder content={children} text={i18n('label_empty-fixed-header')} />
        ) : (
            children
        );

    return (
        <React.Fragment>
            <div
                className={b('controls', {
                    'edit-mode': editMode,
                    hidden: isEmpty && (!editMode || (editMode && isContainerGroupEmpty)),
                })}
                data-qa={FixedHeaderQa.Controls}
            >
                {content}
            </div>
            <div className={b('controls-settings')}>
                <div className={b('controls-settings-wrapper')}>{controls}</div>
            </div>
        </React.Fragment>
    );
};

export const FixedHeaderContainer: React.FC<FixedHeaderContainerProps> = ({
    editMode,
    isEmpty,
    isControlsGroupEmpty,
    children,
}) => {
    const content =
        isEmpty && editMode ? (
            <EmptyPlaceholder
                content={children}
                text={
                    <React.Fragment>
                        <Icon size={16} data={ChevronsUp} />
                        {i18n('label_empty-fixed-content')}
                    </React.Fragment>
                }
                mod="with-offset"
            />
        ) : (
            children
        );

    return (
        <div
            className={b('container', {
                'edit-mode': editMode,
                hidden: isEmpty && (!editMode || (editMode && isControlsGroupEmpty)),
            })}
            data-qa={FixedHeaderQa.Container}
        >
            {content}
        </div>
    );
};

type FixedHeaderWrapperProps = CommonFixedHeaderProps & {
    isCollapsed: boolean;
    isControlsGroupEmpty?: boolean;
    isContainerGroupEmpty?: boolean;
    dashBodyRef: React.RefObject<HTMLDivElement>;
    controlsRef: React.Ref<HTMLDivElement>;
    containerRef: React.Ref<HTMLDivElement>;
    className?: string;
};

export function FixedHeaderWrapper({
    dashBodyRef,
    controlsRef,
    containerRef,
    editMode,
    isCollapsed,
    isControlsGroupEmpty,
    isContainerGroupEmpty,
    className,
}: FixedHeaderWrapperProps) {
    const rootRef = React.useRef<HTMLDivElement>(null);
    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const scrollableContainerRef = React.useRef<HTMLDivElement>(null);

    const [containerHeight, setContainerHeight] = React.useState<'auto' | number>('auto');
    const [scrollableContainerOverflow, setScrollableContainerOverflow] =
        React.useState<React.CSSProperties['overflow']>('auto');

    const topOffset = calculateOffset(dashBodyRef);
    const {isFixed, leftOffset, width} = useFixedHeaderRef(rootRef, topOffset);
    const style = isFixed && !editMode ? {left: leftOffset, top: topOffset, width} : {};

    React.useEffect(() => {
        const observer = new ResizeObserver(([el]) => {
            if (el) {
                const {height} = el.contentRect;
                setContainerHeight(height);
            }
        });

        if (wrapperRef.current) {
            observer.observe(wrapperRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [wrapperRef, topOffset]);

    React.useEffect(() => {
        const observer = new ResizeObserver(([el]) => {
            if (el && scrollableContainerRef.current) {
                const {height} = el.contentRect;
                const maxHeightPx = getComputedStyle(scrollableContainerRef.current).maxHeight;
                const maxHeight = Number.parseInt(maxHeightPx.replace('px', ''));

                const scrollableContentSize = scrollableContainerRef.current.scrollHeight;

                // If scrollableContentSize > height && maxHeight > height,
                // then a scroll appears due to absolutely or fixed-positioned elements.
                // Most likely, they function similarly to popups and can be displayed outside the container.
                const overflow =
                    !Number.isNaN(maxHeight) && scrollableContentSize > height && maxHeight > height
                        ? 'visible'
                        : 'auto';

                setScrollableContainerOverflow(overflow);
            }
        });

        if (scrollableContainerRef.current) {
            observer.observe(scrollableContainerRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [scrollableContainerRef]);

    return (
        <div
            className={b(
                {
                    'no-content': isControlsGroupEmpty && (isContainerGroupEmpty || isCollapsed),
                    'edit-mode': editMode,
                    collapsed: isCollapsed,
                },
                className,
            )}
            ref={rootRef}
            style={{
                height: isFixed ? containerHeight : 'auto',
            }}
        >
            <div
                className={b('wrapper', {
                    fixed: isFixed && !editMode,
                })}
                style={style}
                ref={wrapperRef}
                data-qa={FixedHeaderQa.Wrapper}
            >
                <div className={b('content')}>
                    <div
                        className={b('scrollable-container')}
                        ref={scrollableContainerRef}
                        style={{overflow: scrollableContainerOverflow}}
                    >
                        <div ref={controlsRef} className={b('controls-placeholder')}></div>
                        <div
                            ref={containerRef}
                            className={b('container-placeholder', {
                                collapsed: isCollapsed,
                            })}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
