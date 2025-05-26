import React from 'react';

import {useResizeObserver} from '@gravity-ui/uikit';

export function useActionPanelLayout(): {
    style: React.CSSProperties | undefined;
    actionPanelRef: React.RefObject<HTMLDivElement>;
} {
    const actionPanelRef = React.useRef<HTMLDivElement>(null);
    const [actionPanelStyle, setActionPanelStyle] = React.useState<React.CSSProperties | undefined>(
        undefined,
    );

    const recomputePageOffset = React.useCallback(() => {
        if (actionPanelRef.current) {
            const pageOffset = actionPanelRef.current.getBoundingClientRect().left;
            setActionPanelStyle({paddingInline: `${pageOffset}px`});
        }
    }, [actionPanelRef.current]);

    React.useEffect(() => {
        recomputePageOffset();
    }, [recomputePageOffset]);

    useResizeObserver({
        ref: actionPanelRef,
        onResize: () => recomputePageOffset(),
    });

    return {style: actionPanelStyle, actionPanelRef};
}
