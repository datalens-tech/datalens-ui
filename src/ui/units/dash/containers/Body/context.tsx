import React from 'react';

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
