import React from 'react';

import block from 'bem-cn-lite';
import debounce from 'lodash/debounce';

import './ScrollableWithShadow.scss';

const b = block('dl-scrollable-with-shadow');

export interface ScrollableWithShadowProps {
    children?: React.ReactNode;
    direction?: 'horizontal' | 'vertical';
    shadowSize?: string;
}

/**
 * Scrollable container with shadow indicators
 * @param children - Content without overflow style
 * @param direction - Scroll direction. `vertical` (default) shows top/bottom shadows, `horizontal` shows left/right shadows
 * @param shadowSize - CSS size value for shadow (default: `40px`)
 */
export function ScrollableWithShadow(props: ScrollableWithShadowProps) {
    const {children, direction = 'vertical', shadowSize} = props;
    const containerRef = React.useRef<HTMLDivElement>(null);
    const isHorizontal = direction === 'horizontal';

    const handleScroll: React.UIEventHandler<HTMLDivElement> = React.useCallback(
        (event) => {
            const node = event.target as HTMLDivElement;
            const showTop = node.scrollTop > 0;
            const showBottom =
                node.scrollHeight - Math.ceil(node.clientHeight + node.scrollTop) > 0;
            const showLeft = node.scrollLeft > 0;
            const showRight = node.scrollWidth - Math.ceil(node.clientWidth + node.scrollLeft) > 0;

            if (isHorizontal) {
                const height = node.scrollHeight;
                node.style.setProperty('--dl-scrollable-shadow-height', `${height}px`);
            }

            if (showTop) {
                node.dataset.showTop = '';
            } else {
                delete node.dataset.showTop;
            }

            if (showBottom) {
                node.dataset.showBottom = '';
            } else {
                delete node.dataset.showBottom;
            }

            if (showLeft) {
                node.dataset.showLeft = '';
            } else {
                delete node.dataset.showLeft;
            }

            if (showRight) {
                node.dataset.showRight = '';
            } else {
                delete node.dataset.showRight;
            }
        },
        [isHorizontal],
    );

    const handleScrollDebounced = React.useMemo(() => debounce(handleScroll), [handleScroll]);

    React.useEffect(() => {
        if (containerRef.current && shadowSize) {
            containerRef.current.style.setProperty('--dl-scrollable-shadow-size', shadowSize);
        }
    }, [shadowSize]);

    React.useEffect(() => {
        if (containerRef.current) {
            containerRef.current.dispatchEvent(new Event('scroll'));
        }
    }, [handleScroll]);

    return (
        <div ref={containerRef} className={b()} onScroll={handleScrollDebounced}>
            <div className={b('shadow', {[`${isHorizontal ? 'left' : 'top'}`]: true})}></div>
            <div className={b('shadow', {[`${isHorizontal ? 'right' : 'bottom'}`]: true})}></div>
            {children}
        </div>
    );
}
