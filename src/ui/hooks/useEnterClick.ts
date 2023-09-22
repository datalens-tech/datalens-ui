import React from 'react';

export function useEnterClick<T extends HTMLElement = HTMLElement>(
    ref: React.RefObject<T>,
    handler: (event: KeyboardEvent) => void,
) {
    const callbackRef = React.useRef(handler);

    React.useEffect(() => {
        callbackRef.current = handler;
    }, [handler]);

    React.useEffect(() => {
        const listener = (event: KeyboardEvent) => {
            const element = ref.current;
            if (event.key === 'Enter' && element) {
                callbackRef.current(event);
            }
        };

        document.addEventListener('keydown', listener);

        return () => {
            document.removeEventListener('keydown', listener);
        };
    }, [ref]);
}
