import React from 'react';

import {useResizeObserver} from '@gravity-ui/uikit';

export function useActionPanelLayout(): {
    styles: React.CSSProperties | undefined;
    actionPanelRef: React.RefObject<HTMLDivElement>;
} {
    const actionPanelRef = React.useRef<HTMLDivElement>(null);
    const [actionPanelStyles, setActionPanelStyles] = React.useState<
        React.CSSProperties | undefined
    >(undefined);

    const recomputePageOffset = React.useCallback(() => {
        if (actionPanelRef.current) {
            const pageOffset = actionPanelRef.current.getBoundingClientRect().left;
            setActionPanelStyles({paddingInline: `${pageOffset}px`});
        }
    }, [actionPanelRef.current]);

    React.useEffect(() => {
        recomputePageOffset();
    }, [recomputePageOffset]);

    useResizeObserver({
        ref: actionPanelRef,
        onResize: () => recomputePageOffset(),
    });

    return {styles: actionPanelStyles, actionPanelRef};
}
