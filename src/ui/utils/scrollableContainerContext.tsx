import React from 'react';

interface ScrollableContainerContextValue {
    scrollableContainerRef: React.RefObject<HTMLElement>;
}

const getBlankContextValue = () => ({
    scrollableContainerRef: React.createRef<HTMLElement>(),
});

const ScrollableContainerContext =
    React.createContext<ScrollableContainerContextValue>(getBlankContextValue());

export function ScrollableContainerContextProvider<E extends HTMLElement = HTMLDivElement>({
    children,
}: {
    scrollableContainerRef?: React.Ref<E>;
    children: React.ReactNode;
}) {
    const contextValue = React.useMemo(() => {
        return getBlankContextValue();
    }, []);

    return (
        <ScrollableContainerContext.Provider value={contextValue}>
            {children}
        </ScrollableContainerContext.Provider>
    );
}

export function useScrollableContainerContext() {
    return React.useContext(ScrollableContainerContext) ?? getBlankContextValue;
}
