import React from 'react';

import {ChevronsUp} from '@gravity-ui/icons';
import {Icon, useBodyScrollLock} from '@gravity-ui/uikit';
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

    React.useLayoutEffect(() => {
        const handler = () => {
            const rect = rootRef.current?.getBoundingClientRect();

            setIsFixed(rect ? rect.top <= topOffset : false);
            setLeftOffset(rect?.left || 0);
        };

        const resizeObserver = new ResizeObserver(() => {
            const rect = rootRef.current?.getBoundingClientRect();

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

    return {isFixed, leftOffset};
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
    controlsRef: React.RefObject<HTMLDivElement>;
    containerRef: React.RefObject<HTMLDivElement>;
};

export function FixedHeaderWrapper({
    dashBodyRef,
    controlsRef,
    containerRef,
    editMode,
    isCollapsed,
    isControlsGroupEmpty,
    isContainerGroupEmpty,
}: FixedHeaderWrapperProps) {
    const rootRef = React.useRef<HTMLDivElement>(null);
    const wrapperRef = React.useRef<HTMLDivElement>(null);

    const [containerHeight, setContainerHeight] = React.useState<'auto' | number>('auto');
    const [isScrollLocked, setScrollLock] = React.useState(false);

    const topOffset = calculateOffset(dashBodyRef);
    const {isFixed, leftOffset} = useFixedHeaderRef(rootRef, topOffset);
    const style = isFixed && !editMode ? {left: leftOffset, top: topOffset, right: 0} : {};

    React.useEffect(() => {
        const observer = new ResizeObserver(([el]) => {
            if (el) {
                const {height} = el.contentRect;
                setContainerHeight(height);
                setScrollLock(el.target.scrollHeight + topOffset >= window.innerHeight);
            }
        });

        if (wrapperRef.current) {
            observer.observe(wrapperRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [wrapperRef, topOffset]);

    const isScrollCaptured = isFixed && !editMode && !isCollapsed && isScrollLocked;

    useBodyScrollLock({enabled: isScrollCaptured});

    return (
        <div
            className={b({
                'no-content': isControlsGroupEmpty && (isContainerGroupEmpty || isCollapsed),
                'edit-mode': editMode,
                collapsed: isCollapsed,
            })}
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
                    <div className={b('scrollable-container')}>
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
