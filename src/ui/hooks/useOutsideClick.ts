import React from 'react';

export function useOutsideClick<T extends HTMLElement = HTMLElement>(
    ref: React.RefObject<T>,
    handler: (event: MouseEvent | TouchEvent) => void,
    additionalCheckToIgnoreClick?: (event: MouseEvent | TouchEvent) => boolean,
) {
    const callbackRef = React.useRef(handler);

    React.useEffect(() => {
        callbackRef.current = handler;
    }, [handler]);

    React.useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            if (
                !ref.current ||
                ref.current.contains(event.target as Node) ||
                (typeof additionalCheckToIgnoreClick !== 'undefined' &&
                    additionalCheckToIgnoreClick(event))
            ) {
                return;
            }

            callbackRef.current(event);
        };

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, additionalCheckToIgnoreClick]);
}
