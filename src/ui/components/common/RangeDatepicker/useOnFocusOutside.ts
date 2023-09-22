import React from 'react';

export function useOnFocusOutside(onFocusOutside: () => void, enable = true) {
    const capturedRef = React.useRef(false);

    React.useEffect(() => {
        if (enable) {
            const handleFocus = function () {
                capturedRef.current = false;
                window.setTimeout(() => {
                    if (!capturedRef.current) {
                        onFocusOutside();
                    }
                }, 0);
            };

            window.addEventListener('focus', handleFocus, {capture: true});

            return () => {
                window.removeEventListener('focus', handleFocus, {capture: true});
            };
        }

        return undefined;
    }, [enable, onFocusOutside]);

    return React.useCallback(() => {
        capturedRef.current = true;
    }, []);
}
