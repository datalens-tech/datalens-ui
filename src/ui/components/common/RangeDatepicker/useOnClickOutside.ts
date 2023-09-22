import React from 'react';

export function useOnClickOutside(onClickOutside: () => void, enable = true) {
    const capturedRef = React.useRef(false);

    React.useEffect(() => {
        if (enable) {
            const handleClick = function () {
                capturedRef.current = false;
                window.setTimeout(() => {
                    if (!capturedRef.current) {
                        onClickOutside();
                    }
                }, 0);
            };

            window.addEventListener('click', handleClick, {capture: true});

            return () => {
                window.removeEventListener('click', handleClick, {capture: true});
            };
        }

        return undefined;
    }, [enable, onClickOutside]);

    return React.useCallback(() => {
        capturedRef.current = true;
    }, []);
}
