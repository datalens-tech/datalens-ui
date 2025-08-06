import React from 'react';

export type WidgetCallbacksContext = {
    onWidgetMountChange: (isMounted: boolean, id: string, domElement: HTMLElement) => void;
};

export const WidgetContext = React.createContext<WidgetCallbacksContext | null>(null);

export const WidgetContextProvider: React.FC<WidgetCallbacksContext> = (props) => {
    const contextValue = React.useMemo(
        () => ({
            onWidgetMountChange: props.onWidgetMountChange,
        }),
        [props.onWidgetMountChange],
    );

    return <WidgetContext.Provider value={contextValue}>{props.children}</WidgetContext.Provider>;
};

export const useWidgetContext = (id: string, elementRef: React.RefObject<HTMLElement | null>) => {
    const context = React.useContext(WidgetContext);
    const onMountChange = context?.onWidgetMountChange;

    React.useEffect(() => {
        const element = elementRef.current;

        if (element && onMountChange) {
            onMountChange(true, id, element);

            return () => {
                onMountChange(false, id, element);
            };
        }

        return () => {};
    }, [id, elementRef, onMountChange]);
};
