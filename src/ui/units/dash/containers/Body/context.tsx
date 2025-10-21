import React from 'react';

import {createPortal} from 'react-dom';

import {MobileFloatMenu, type MobileFloatMenuProps} from '../MobileFloatMenu/MobileFloatMenu';

export const RefsContext = React.createContext<{
    fixedHeaderControlsEl: HTMLDivElement | null;
    fixedHeaderContainerEl: HTMLDivElement | null;
    dashEl: HTMLDivElement | null;
}>({fixedHeaderControlsEl: null, fixedHeaderContainerEl: null, dashEl: null});

export function RefsContextProvider({
    fixedHeaderControlsEl,
    fixedHeaderContainerEl,
    dashEl,
    children,
}: {
    fixedHeaderControlsEl: HTMLDivElement | null;
    fixedHeaderContainerEl: HTMLDivElement | null;
    dashEl: HTMLDivElement | null;
    children: React.ReactNode;
}) {
    const value = React.useMemo(
        () => ({
            fixedHeaderControlsEl,
            fixedHeaderContainerEl,
            dashEl,
        }),
        [fixedHeaderControlsEl, fixedHeaderContainerEl, dashEl],
    );

    return <RefsContext.Provider value={value}>{children}</RefsContext.Provider>;
}

export function FixedControlsWrapperWithContext({content}: {content: React.ReactNode}) {
    const {fixedHeaderControlsEl} = React.useContext(RefsContext);

    if (fixedHeaderControlsEl) {
        return createPortal(content, fixedHeaderControlsEl, 'fixed-header-controls-mounted');
    }
    return null;
}

export function FixedContainerWrapperWithContext({content}: {content: React.ReactNode}) {
    const {fixedHeaderContainerEl} = React.useContext(RefsContext);

    if (fixedHeaderContainerEl) {
        return createPortal(content, fixedHeaderContainerEl, 'fixed-header-container-mounted');
    }
    return null;
}

export function FloatingMobileMenuWithContext(props: Omit<MobileFloatMenuProps, 'dashEl'>) {
    const {dashEl} = React.useContext(RefsContext);

    if (dashEl) {
        return <MobileFloatMenu {...props} dashEl={dashEl} />;
    }
    return null;
}
