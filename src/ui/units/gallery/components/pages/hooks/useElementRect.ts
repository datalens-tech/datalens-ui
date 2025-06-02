import React from 'react';

interface UseElementRectProps {
    node?: HTMLDivElement | null;
}

export function useElementRect({node}: UseElementRectProps): {
    rect: DOMRect | null;
} {
    const [rect, setRect] = React.useState<DOMRect | null>(null);

    const recomputePadding = React.useCallback(() => {
        if (node) {
            setRect(node.getBoundingClientRect());
        }
    }, [node]);

    React.useEffect(() => {
        recomputePadding();
    }, [recomputePadding]);

    React.useEffect(() => {
        window.addEventListener('resize', recomputePadding);

        return () => {
            window.removeEventListener('resize', recomputePadding);
        };
    }, [recomputePadding]);

    return {rect};
}
