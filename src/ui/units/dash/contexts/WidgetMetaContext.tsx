import React from 'react';

export type WidgetMetaContextValue = {
    registerCallback: (widgetId: string, callback: CallbackType) => void;
    loadHiddenWidgetsMeta: LoadHiddenWidgetsMetaType;
    unregisterCallback: (widgetId: string) => void;
    clearCallbacks: () => void;
    getRegisteredWidgetIds: () => string[];
    hasRegisteredWidgetId: (widgetId: string) => boolean;
};

export type LoadHiddenWidgetsMetaType = ({
    widgetIds,
    preventFetchIds,
    widgetId,
    tabId,
}: {
    widgetIds: string[];
    preventFetchIds: string[];
    widgetId: string;
    tabId: string;
}) => Promise<Record<string, object>>;

type CallbackType = ({
    preventFetchIds,
    tabId,
}: {
    preventFetchIds: string[];
    tabId: string;
}) => Promise<unknown>;

export const WidgetMetaContext = React.createContext<WidgetMetaContextValue | null>(null);

export interface MetaCallbackProviderProps {
    children: React.ReactNode;
}

export const WidgetMetaProvider: React.FC<MetaCallbackProviderProps> = ({children}) => {
    const callbacksRef = React.useRef<Map<string, CallbackType>>(new Map());

    console.log(callbacksRef.current, 'callbacks current state');

    const registerCallback = React.useCallback(
        (widgetId: string, callback: () => Promise<unknown[]>) => {
            console.log(widgetId, 'registry with thsi widgetId');
            callbacksRef.current.set(widgetId, callback);
            console.log(callbacksRef.current, 'callbacks');
        },
        [],
    );

    const loadHiddenWidgetsMeta = React.useCallback(
        async ({
            widgetIds,
            preventFetchIds,
            tabId,
            widgetId,
        }: {
            widgetIds: string[];
            preventFetchIds: string[];
            tabId: string;
            widgetId: string;
        }) => {
            // const promises: Promise<unknown[]>[] = [];
            // console.log(callbacksRef.current, 'callbacks');

            // for (const widgetId of widgetIds) {
            //     const callback = callbacksRef.current.get(widgetId);
            //     if (callback) {
            //         promises.push(callback({preventFetchIds, tabId}));
            //     }
            // }

            // const results = await Promise.all(promises);
            // console.log(results, 'results');
            // const resultObject: Record<string, unknown> = {};

            // // Преобразуем массив массивов объектов в объект
            // results.forEach((arrayOfObjects) => {
            //     arrayOfObjects.forEach((obj: any) => {
            //         if (obj && typeof obj === 'object' && obj.widgetId) {
            //             resultObject[obj.widgetId] = obj;
            //         }
            //     });
            // });

            // return resultObject;
            const callback = callbacksRef.current.get(widgetId);

            if (callback) {
                const result = await callback({preventFetchIds, tabId});
                return result;
            }

            return null;
        },
        [],
    );

    const unregisterCallback = React.useCallback((widgetId: string) => {
        callbacksRef.current.delete(widgetId);
    }, []);

    const clearCallbacks = React.useCallback(() => {
        callbacksRef.current.clear();
    }, []);

    const hasRegisteredWidgetId = React.useCallback((widgetId: string): boolean => {
        return callbacksRef.current.has(widgetId);
    }, []);

    const getRegisteredWidgetIds = React.useCallback((): string[] => {
        return Array.from(callbacksRef.current.keys());
    }, []);

    React.useEffect(() => {
        return () => {
            callbacksRef.current.clear();
        };
    }, []);

    const contextValue: WidgetMetaContextValue = React.useMemo(
        () => ({
            registerCallback,
            loadHiddenWidgetsMeta,
            unregisterCallback,
            clearCallbacks,
            getRegisteredWidgetIds,
            hasRegisteredWidgetId,
        }),
        [
            registerCallback,
            loadHiddenWidgetsMeta,
            unregisterCallback,
            clearCallbacks,
            getRegisteredWidgetIds,
            hasRegisteredWidgetId,
        ],
    );

    return <WidgetMetaContext.Provider value={contextValue}>{children}</WidgetMetaContext.Provider>;
};

export const useWidgetContext = (): WidgetMetaContextValue => {
    const context = React.useContext(WidgetMetaContext);

    if (!context) {
        throw new Error('useWidgetContext must be used within a WidgetMetaProvider');
    }

    return context;
};
