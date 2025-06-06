import React from 'react';

import {useForkRef} from '@gravity-ui/uikit';
import {throttle} from 'lodash';

const THROTTLE_DELAY = 100;

interface State {
    bottomShade: boolean;
    leftShade: boolean;
    rightShade: boolean;
    topShade: boolean;
    scrollBarWidth: number;
    padding: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    height: number;
    width: number;
}

interface WithScrollShadesProps {
    styleClassName: string;
    isActiveMediaQueryS?: boolean;
}

/**
 * Higher Order Component that adds scroll shadows to a component.
 * Shows gradient shadows when content is scrollable in any direction.
 *
 * @example
 * ```typescript
 * // Create a scrollable component with shadows
 * const ScrollableComponent = withScrollShades(MyComponent);
 *
 * // Usage
 * // Parent container must have position: relative or absolute
 * <div style={{ position: 'relative' }}>
 *   <ScrollableComponent styleClassName="my-scrollable" />
 * </div>
 * ```
 *
 * @param WrappedComponent - React component to wrap with scroll shadows
 * @returns Component with added scroll shadows
 *
 * @note The parent container of the wrapped component must have `position: relative` or `position: absolute`
 * for the shadows to be positioned correctly.
 */
export function withScrollShades<P extends object>(WrappedComponent: React.ComponentType<P>) {
    return React.forwardRef<HTMLDivElement, P & WithScrollShadesProps>(
        function WithScrollShades(props, ref) {
            const {styleClassName, isActiveMediaQueryS = false, ...restProps} = props;
            const containerRef = React.useRef<HTMLDivElement>(null);
            const mergedRef = useForkRef(containerRef, ref);
            const [state, setState] = React.useState<State>({
                bottomShade: false,
                leftShade: false,
                rightShade: false,
                topShade: false,
                scrollBarWidth: 0,
                padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                },
                height: 0,
                width: 0,
            });

            const containerNode = containerRef.current;
            const wrappedComponentClassNames = 'className' in restProps ? restProps.className : '';

            const handlePreviewScroll = React.useCallback(() => {
                if (!containerRef.current) {
                    return;
                }

                const {
                    clientHeight,
                    clientWidth,
                    offsetHeight,
                    scrollHeight,
                    scrollLeft,
                    scrollTop,
                    scrollWidth,
                } = containerRef.current;

                const parentContainer = containerRef.current.parentElement;
                let computedStyle: CSSStyleDeclaration | undefined;

                if (parentContainer) {
                    computedStyle = window.getComputedStyle(parentContainer);
                }

                const padding = {
                    top: parseInt(computedStyle?.paddingTop || '0', 10),
                    right: parseInt(computedStyle?.paddingRight || '0', 10),
                    bottom: parseInt(computedStyle?.paddingBottom || '0', 10),
                    left: parseInt(computedStyle?.paddingLeft || '0', 10),
                };

                if (scrollHeight < clientHeight) {
                    return;
                }

                let scrollBarWidth = 0;
                let hasScroll = false;
                let showTopShade = false;
                let showBottomShade = false;
                let showLeftShade = false;
                let showRightShade = false;

                if (isActiveMediaQueryS) {
                    scrollBarWidth = offsetHeight - clientHeight;
                    hasScroll = scrollWidth > clientWidth;
                    showLeftShade = hasScroll && scrollLeft !== 0;
                    showRightShade = hasScroll && scrollWidth - clientWidth > scrollLeft;
                } else {
                    scrollBarWidth = offsetHeight - clientHeight;
                    hasScroll = scrollHeight > clientHeight;
                    showTopShade = hasScroll && scrollTop !== 0;
                    showBottomShade = hasScroll && scrollHeight - clientHeight > scrollTop;
                }

                setState({
                    bottomShade: showBottomShade,
                    leftShade: showLeftShade,
                    rightShade: showRightShade,
                    topShade: showTopShade,
                    padding,
                    scrollBarWidth,
                    height: containerRef.current?.getBoundingClientRect().height || 0,
                    width: containerRef.current?.getBoundingClientRect().width || 0,
                });
            }, [isActiveMediaQueryS]);

            const throttledHandlePreviewScroll = React.useMemo(
                () => throttle(handlePreviewScroll, THROTTLE_DELAY),
                [handlePreviewScroll],
            );

            React.useEffect(() => {
                window.addEventListener('resize', throttledHandlePreviewScroll);
                containerNode?.addEventListener('scroll', throttledHandlePreviewScroll);

                handlePreviewScroll();

                return () => {
                    window.removeEventListener('resize', throttledHandlePreviewScroll);
                    containerNode?.removeEventListener('scroll', throttledHandlePreviewScroll);
                    throttledHandlePreviewScroll.cancel();
                };
            }, [containerNode, handlePreviewScroll, throttledHandlePreviewScroll]);

            const gradientShadowStyles = React.useMemo(() => {
                const baseStyles = `
                .${styleClassName}::before,
                .${styleClassName}::after {
                    content: '';
                    position: absolute;
                    pointer-events: none;
                    z-index: 1;
                }
            `;

                const directionStyles = {
                    bottom: `
                    .${styleClassName}::after {
                        left: ${state.padding.left}px;
                        bottom: ${state.padding.bottom}px;
                        height: 40px;
                        width: ${state.width}px;
                        background: linear-gradient(to bottom, transparent, var(--g-color-base-background));
                    }
                `,
                    top: `
                    .${styleClassName}::before {
                        left: ${state.padding.left}px;
                        top: ${state.padding.top}px;
                        height: 40px;
                        width: ${state.width}px;
                        background: linear-gradient(to top, transparent, var(--g-color-base-background));
                    }
                `,
                    left: `
                    .${styleClassName}::before {
                        left: ${state.padding.left}px;
                        top: ${state.padding.top}px;
                        height: ${state.height}px;
                        width: 40px;
                        background: linear-gradient(to left, transparent, var(--g-color-base-background));
                    }
                `,
                    right: `
                    .${styleClassName}::after {
                        right: ${state.padding.right}px;
                        top: ${state.padding.top}px;
                        height: ${state.height}px;
                        width: 40px;
                        background: linear-gradient(to right, transparent, var(--g-color-base-background));
                    }
                `,
                };

                const activeShades = [
                    state.bottomShade && directionStyles.bottom,
                    state.topShade && directionStyles.top,
                    state.leftShade && directionStyles.left,
                    state.rightShade && directionStyles.right,
                ]
                    .filter(Boolean)
                    .join('\n');

                return `${baseStyles}\n${activeShades}`;
            }, [styleClassName, state]);

            return (
                <React.Fragment>
                    <style>{gradientShadowStyles}</style>
                    <WrappedComponent
                        {...(restProps as P)}
                        ref={mergedRef}
                        className={`${styleClassName} ${wrappedComponentClassNames}`}
                    />
                </React.Fragment>
            );
        },
    );
}
