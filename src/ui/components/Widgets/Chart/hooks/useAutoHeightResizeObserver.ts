import React from 'react';

/**
 * resizeObserver hook takes two conditional options
 * isInit - enables resizeObserver only for loaded components
 * autoHeight - property if changes to false removes resizeObserver
 * onResize is only called when width is changes, height is ignored
 */
export const useResizeObserver = (options: {
    rootNodeRef: React.RefObject<HTMLElement>;
    onResize: () => void;
    enable: boolean;
}) => {
    const {rootNodeRef, enable, onResize} = options;

    const isInitResizeCall = React.useRef(true);
    const resizeObserver = React.useRef<ResizeObserver | null>(null);
    const previousWidthValue = React.useRef<number | null>(null);

    const onResizeRef = React.useRef(onResize);
    onResizeRef.current = onResize;

    const resizeObserverHandler = React.useCallback(() => {
        if (!rootNodeRef.current) {
            return;
        }

        const {clientWidth} = rootNodeRef.current;
        if (isInitResizeCall.current) {
            isInitResizeCall.current = false;
            previousWidthValue.current = clientWidth;
            return;
        }

        if (previousWidthValue.current === clientWidth) {
            // As we are looking only cases when width change skipping other cases
            // to prevent when autoHeight value is set
            return;
        }

        previousWidthValue.current = clientWidth;
        onResizeRef.current();
    }, [onResizeRef, previousWidthValue, rootNodeRef, isInitResizeCall]);

    const disconnectResizeObserver = React.useCallback(() => {
        if (resizeObserver.current) {
            resizeObserver.current.disconnect();
            resizeObserver.current = null;
            isInitResizeCall.current = true;
        }
    }, [resizeObserver, isInitResizeCall]);

    React.useLayoutEffect(() => {
        if (!rootNodeRef.current) {
            return;
        }

        if (!enable) {
            disconnectResizeObserver();
            return;
        } else if (!resizeObserver.current) {
            previousWidthValue.current = null;
            resizeObserver.current = new ResizeObserver(resizeObserverHandler);
            resizeObserver.current.observe(rootNodeRef.current);
        }
    }, [enable, rootNodeRef, resizeObserver, resizeObserverHandler, disconnectResizeObserver]);

    // Unmount
    React.useEffect(() => {
        return () => {
            if (resizeObserver.current) {
                resizeObserver.current.disconnect();
                resizeObserver.current = null;
            }
        };
    }, [resizeObserver]);
};
