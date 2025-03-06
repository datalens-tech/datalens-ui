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

const CONTROLS_TOP_EMBEDDED_OFFSET = 0;
const CONTROLS_TOP_PUBLIC_OFFSET = 70;
const CONTROLS_TOP_DEFAULT_NAV_OFFSET = 40;

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
                hidden: isEmpty && !editMode,
            })}
            data-qa={FixedHeaderQa.Container}
        >
            {content}
        </div>
    );
};

type FixedHeaderWrapperProps = CommonFixedHeaderProps & {
    isCollapsed: boolean;
    isEmbedded?: boolean;
    isPublic?: boolean;
    isControlsGroupEmpty?: boolean;
    isContainerGroupEmpty?: boolean;
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
    isControlsGroupEmpty,
    isContainerGroupEmpty,
}: FixedHeaderWrapperProps) {
    const rootRef = React.useRef<HTMLDivElement>(null);
    const wrapperRef = React.useRef<HTMLDivElement>(null);

    const [containerHeight, setContainerHeight] = React.useState<'auto' | number>('auto');
    const [isScrollLocked, setScrollLock] = React.useState(false);

    const topOffset = calculateOffset({isEmbedded, isPublic});
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

    const collapsibleGroupHidden = isCollapsed && !editMode;

    return (
        <div
            className={b({
                'no-content':
                    isControlsGroupEmpty && (isContainerGroupEmpty || collapsibleGroupHidden),
            })}
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
                data-qa={FixedHeaderQa.Wrapper}
            >
                <div className={b('content')}>
                    <div className={b('scrollable-container')}>
                        <div ref={controlsRef} className={b('controls-placeholder')}></div>
                        <div
                            ref={containerRef}
                            className={b('container-placeholder', {
                                collapsed: collapsibleGroupHidden,
                            })}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
