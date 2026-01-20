import React from 'react';

export const useWrapperBounds = (): {
    wrapperCallbackRef: (node: HTMLDivElement | null) => void;
    bottomOffset: number;
} => {
    const [bottomOffset, setBottomOffset] = React.useState(0);

    const observerRef = React.useRef<ResizeObserver | null>(null);

    const wrapperCallbackRef = React.useCallback((node: HTMLDivElement | null) => {
        if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
        }

        const getElementBottomOffset = (element: Element): number => {
            return Math.max(0, window.innerHeight - element.getBoundingClientRect().bottom);
        };

        if (node) {
            setBottomOffset(getElementBottomOffset(node));

            const resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    setBottomOffset(getElementBottomOffset(entry.target));
                }
            });

            observerRef.current = resizeObserver;
            resizeObserver.observe(node);
        }
    }, []);

    React.useEffect(() => {
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    return {
        wrapperCallbackRef,
        bottomOffset,
    };
};
