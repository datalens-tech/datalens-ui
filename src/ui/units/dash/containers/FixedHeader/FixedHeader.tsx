import React from 'react';

import {useBodyScrollLock} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {FixedHeaderQa} from 'shared';

import './FixedHeader.scss';

type FixedHeaderContainerProps = {
    isEmpty: boolean;
    isCollapsed: boolean;
    isEmbedded?: boolean;
    isPublic?: boolean;
    editMode: boolean;
};

type FixedHeaderControlsProps = FixedHeaderContainerProps & {
    controls: React.ReactNode;
};

const b = block('dash-fixed-header');
const i18n = I18n.keyset('dash.empty-state.view');

const CONTROLS_TOP_EMBEDDED_OFFSET = 0;
const CONTROLS_TOP_PUBLIC_OFFSET = 70;
const CONTROLS_TOP_DEFAULT_NAV_OFFSET = 40;
const CONTAINER_TOP_OFFSET = 60;

const CONTAINER_PADDING_OFFSET = 48;

const calculateOffset = (
    pageOptions: {isEmbedded?: boolean; isPublic?: boolean},
    blockType: 'controls' | 'content' = 'controls',
) => {
    let globalOffset = CONTROLS_TOP_DEFAULT_NAV_OFFSET;
    if (pageOptions.isEmbedded) {
        globalOffset = CONTROLS_TOP_EMBEDDED_OFFSET;
    } else if (pageOptions.isPublic) {
        globalOffset = CONTROLS_TOP_PUBLIC_OFFSET;
    }

    if (blockType === 'content') {
        return globalOffset + CONTAINER_TOP_OFFSET;
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

export const FixedHeaderControls: React.FC<FixedHeaderControlsProps> = (props) => {
    const rootRef = React.useRef<HTMLDivElement>(null);
    const {editMode, isEmpty} = props;
    const topOffset = calculateOffset({isEmbedded: props.isEmbedded, isPublic: props.isPublic});
    const {isFixed, leftOffset, width} = useFixedHeaderRef(rootRef, topOffset);

    const children = !editMode && isEmpty ? null : props.children;
    const style = isFixed && !editMode ? {left: leftOffset, top: topOffset, width} : {};

    const content =
        isEmpty && editMode ? (
            <EmptyPlaceholder content={children} text={i18n('label_empty-fixed-header')} />
        ) : (
            children
        );

    return (
        <div ref={rootRef} className={b('controls-placeholder')}>
            <div
                style={style}
                className={b('controls', {
                    fixed: isFixed && !editMode,
                    'edit-mode': editMode,
                })}
                data-qa={FixedHeaderQa.Controls}
            >
                <div className={b('controls-grid')}>{content}</div>
                <div className={b('controls-settings')}>
                    <div className={b('controls-settings-wrapper')}>{props.controls}</div>
                </div>
            </div>
        </div>
    );
};

export const FixedHeaderContainer: React.FC<FixedHeaderContainerProps> = (props) => {
    const {editMode, isEmpty} = props;
    const rootRef = React.useRef<HTMLDivElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const topOffset = calculateOffset(
        {isEmbedded: props.isEmbedded, isPublic: props.isPublic},
        'content',
    );
    const [isScrollLocked, setScrollLock] = React.useState(false);

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
                setScrollLock(el.target.scrollHeight + topOffset >= window.innerHeight);
            }
        });

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        // eslint-disable-next-line consistent-return
        return () => {
            observer.disconnect();
        };
    }, [containerRef, isRenderEmpty]);
    const {isFixed, leftOffset, width} = useFixedHeaderRef(rootRef, topOffset);
    const isScrollCaptured = isFixed && !editMode && !props.isCollapsed && isScrollLocked;

    useBodyScrollLock({enabled: isScrollCaptured});

    const style = isFixed && !editMode ? {left: leftOffset, top: topOffset, width} : {};

    const content =
        isEmpty && editMode ? (
            <EmptyPlaceholder
                content={props.children}
                text={i18n('label_empty-fixed-content')}
                mod="with-offset"
            />
        ) : (
            props.children
        );

    return (
        <div
            ref={rootRef}
            className={b('container-placeholder', {'edit-mode': editMode})}
            style={{height: containerHeight}}
        >
            <div
                ref={containerRef}
                style={style}
                className={b('container', {
                    fixed: isFixed && !editMode,
                    collapsed: (!editMode && props.isCollapsed) || isRenderEmpty,
                    'edit-mode': editMode,
                })}
                data-qa={FixedHeaderQa.Container}
            >
                <div className={b('container-wrapper')}>{content}</div>
            </div>
        </div>
    );
};
