import React from 'react';

function getCurrentPixelRatio() {
    if (typeof window !== 'undefined' && 'devicePixelRatio' in window) {
        return window.devicePixelRatio;
    }

    return undefined;
}

export const useDevicePixelRatio = () => {
    const [ratio, setPixelRatio] = React.useState(getCurrentPixelRatio());

    const updatePixelRatio = React.useCallback(() => {
        setPixelRatio(getCurrentPixelRatio());
    }, []);

    React.useLayoutEffect(() => {
        const mqString = `(resolution: ${ratio}dppx)`;
        const media = matchMedia(mqString);
        media.addEventListener('change', updatePixelRatio, {once: true});

        return () => {
            media.removeEventListener('change', updatePixelRatio);
        };
    }, [ratio, updatePixelRatio]);

    return ratio;
};
