import React from 'react';

import {useResizeObserver} from '@gravity-ui/uikit';

export function useActionPanelLayout() {
    const actionPanelRef = React.useRef<HTMLDivElement>(null);
    const [pageOffset, setPageOffset] = React.useState<number | undefined>(undefined);

    const recomputePageOffset = React.useCallback(() => {
        if (actionPanelRef.current) {
            setPageOffset(actionPanelRef.current.getBoundingClientRect().left);
        }
    }, [actionPanelRef.current]);

    React.useEffect(() => {
        recomputePageOffset();
    }, [recomputePageOffset]);

    useResizeObserver({
        ref: actionPanelRef,
        onResize: () => recomputePageOffset(),
    });

    return {pageOffset: pageOffset ? `${pageOffset}px` : undefined, actionPanelRef};
}
