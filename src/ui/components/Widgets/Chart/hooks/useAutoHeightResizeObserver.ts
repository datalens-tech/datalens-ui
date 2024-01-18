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
    isInit: boolean;
    autoHeight: boolean;
}) => {
    const isInitResizeCall = React.useRef(true);
    const resizeObserver = React.useRef<ResizeObserver | null>(null);
    const previousWidthValue = React.useRef<number | null>(null);
    const {isInit, rootNodeRef, autoHeight, onResize} = options;

    const resizeObserverHandler = React.useCallback(() => {
        if (!rootNodeRef.current) {
            return;
        }

        const {clientWidth} = rootNodeRef.current;
        if (isInitResizeCall.current) {
            // Skipping first call as it's init call and saving width value
            previousWidthValue.current = clientWidth;
            isInitResizeCall.current = false;
            return;
        } else if (previousWidthValue.current === clientWidth) {
            // As we are looking only cases when width change skipping other cases
            // to prevent when autoHeight value is set
            return;
        }

        previousWidthValue.current = clientWidth;
        onResize();
    }, [isInitResizeCall, onResize, previousWidthValue, rootNodeRef]);

    const disconnectResizeObserver = React.useCallback(() => {
        if (resizeObserver.current) {
            resizeObserver.current.disconnect();
            resizeObserver.current = null;
            isInitResizeCall.current = true;
        }
    }, [resizeObserver, isInitResizeCall]);

    React.useLayoutEffect(() => {
        if (!rootNodeRef.current || !isInit) {
            return;
        }

        if (!autoHeight) {
            disconnectResizeObserver();
            return;
        }

        if (!resizeObserver.current) {
            previousWidthValue.current = null;
            resizeObserver.current = new ResizeObserver(resizeObserverHandler);
            resizeObserver.current.observe(rootNodeRef.current);
        }
    }, [
        isInit,
        autoHeight,
        rootNodeRef,
        resizeObserver,
        resizeObserverHandler,
        disconnectResizeObserver,
    ]);

    React.useEffect(() => () => disconnectResizeObserver(), [disconnectResizeObserver]);
};
