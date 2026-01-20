import React from 'react';

export const useWrapperBounds = (
    wrapperRef: React.MutableRefObject<HTMLDivElement | null>,
): {
    bottomOffset: number;
} => {
    const [bottomOffset, setBottomOffset] = React.useState(0);

    const observerRef = React.useRef<ResizeObserver | null>(null);

    const getElementBottomOffset = React.useCallback((element: Element): number => {
        return Math.max(0, window.innerHeight - element.getBoundingClientRect().bottom);
    }, []);

    React.useEffect(() => {
        const node = wrapperRef.current;

        if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
        }

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

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [wrapperRef, getElementBottomOffset]);

    return {
        bottomOffset,
    };
};
