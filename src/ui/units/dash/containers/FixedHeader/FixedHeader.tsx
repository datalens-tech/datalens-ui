import React from 'react';

import {useBodyScrollLock} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {FixedHeaderQa} from 'shared';

import './FixedHeader.scss';

type CommonFixedHeaderProps = {
    editMode: boolean;
};

type FixedHeaderControlsProps = CommonFixedHeaderProps & {
    isEmpty: boolean;
    controls: React.ReactNode;
};

type FixedHeaderContainerProps = CommonFixedHeaderProps & {
    isEmpty: boolean;
};

const b = block('dash-fixed-header');
const i18n = I18n.keyset('dash.empty-state.view');

const CONTROLS_TOP_EMBEDDED_OFFSET = 0;
const CONTROLS_TOP_PUBLIC_OFFSET = 70;
const CONTROLS_TOP_DEFAULT_NAV_OFFSET = 40;

const CONTAINER_PADDING_OFFSET = 48;

const calculateOffset = (pageOptions: {isEmbedded?: boolean; isPublic?: boolean}) => {
    let globalOffset = CONTROLS_TOP_DEFAULT_NAV_OFFSET;
    if (pageOptions.isEmbedded) {
        globalOffset = CONTROLS_TOP_EMBEDDED_OFFSET;
    } else if (pageOptions.isPublic) {
        globalOffset = CONTROLS_TOP_PUBLIC_OFFSET;
    }

    return globalOffset;
};

const EmptyPlaceholder = ({
    content,
    text,
    mod,
}: {
    content: React.ReactNode;
    text: string;
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

            setWidth(rect?.width ? rect.width + CONTAINER_PADDING_OFFSET : '100%');
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
                    hidden: isEmpty && !editMode,
                })}
                data-qa={FixedHeaderQa.Controls}
            >
                {content}
            </div>
            <div className={b('controls-settings')}>{controls}</div>
        </React.Fragment>
    );
};

export const FixedHeaderContainer: React.FC<FixedHeaderContainerProps> = ({
    editMode,
    isEmpty,
    children,
}) => {
    const content =
        isEmpty && editMode ? (
            <EmptyPlaceholder
                content={children}
                text={i18n('label_empty-fixed-content')}
                mod="with-offset"
            />
        ) : (
            children
        );

    return (
        <div
            data-qa={FixedHeaderQa.Container}
            className={b('container', {
                'edit-mode': editMode,
                hidden: isEmpty && !editMode,
            })}
        >
            {content}
        </div>
    );
};

type FixedHeaderWrapperProps = CommonFixedHeaderProps & {
    isCollapsed: boolean;
    isEmbedded?: boolean;
    isPublic?: boolean;
    controlsRef: React.RefObject<HTMLDivElement>;
    containerRef: React.RefObject<HTMLDivElement>;
};

export function FixedHeaderWrapper({
    controlsRef,
    containerRef,
    editMode,
    isEmbedded,
    isPublic,
    isCollapsed,
}: FixedHeaderWrapperProps) {
    const rootRef = React.useRef<HTMLDivElement>(null);
    const wrapperRef = React.useRef<HTMLDivElement>(null);

    const [containerHeight, setContainerHeight] = React.useState<'auto' | number>('auto');
    const [isScrollLocked, setScrollLock] = React.useState(false);

    const topOffset = calculateOffset({isEmbedded, isPublic});
    const {isFixed, leftOffset, width} = useFixedHeaderRef(rootRef, topOffset);
    const style = isFixed && !editMode ? {left: leftOffset, top: topOffset, width} : {};

    const isRenderEmpty =
        controlsRef.current?.getBoundingClientRect().height === 0 &&
        containerRef.current?.getBoundingClientRect().height === 0;

    React.useEffect(() => {
        if (isRenderEmpty) {
            setContainerHeight(0);
            return;
        }

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

        // eslint-disable-next-line consistent-return
        return () => {
            observer.disconnect();
        };
    }, [isRenderEmpty, wrapperRef, topOffset]);

    const isScrollCaptured = isFixed && !editMode && !isCollapsed && isScrollLocked;

    useBodyScrollLock({enabled: isScrollCaptured});

    return (
        <div
            className={b({hidden: isRenderEmpty})}
            ref={rootRef}
            style={{
                height: isFixed ? containerHeight : 'auto',
            }}
        >
            <div
                className={b('wrapper', {
                    fixed: isFixed && !editMode,
                    'edit-mode': editMode,
                })}
                style={style}
                ref={wrapperRef}
            >
                <div className={b('content')}>
                    <div className={b('scrollable-container')}>
                        <div ref={controlsRef} className={b('controls-placeholder')}></div>
                        <div
                            ref={containerRef}
                            className={b('container-placeholder', {
                                collapsed: isCollapsed && !editMode,
                            })}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
