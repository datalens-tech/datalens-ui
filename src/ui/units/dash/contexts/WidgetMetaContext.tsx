import React from 'react';

import type {DashkitMetaDataItemBase} from 'ui/components/DashKit/plugins/types';
import type {CurrentRequestState} from 'ui/components/Widgets/Chart/types';

export type WidgetMetaContextValue = {
    registerCallback: (widgetId: string, callback: LoadHiddenWidgetMetaCallbackType) => void;
    loadHiddenWidgetMeta: LoadHiddenWidgetMetaType;
    unregisterCallback: (widgetId: string) => void;
    clearCallbacks: () => void;
    getRegisteredWidgetIds: () => string[];
    hasRegisteredWidgetId: (widgetId: string) => boolean;
};

export type LoadHiddenWidgetMetaType = ({
    widgetId,
    subItemId,
    silentRequestCancellationRef,
}: {
    widgetId?: string;
    subItemId: string | null;
    silentRequestCancellationRef?: React.MutableRefObject<CurrentRequestState>;
}) => Promise<Omit<DashkitMetaDataItemBase, 'defaultParams'> | null>;

export type LoadHiddenWidgetMetaCallbackType = ({
    subItemId,
    silentRequestCancellationRef,
}: {
    subItemId: string;
    silentRequestCancellationRef?: React.MutableRefObject<CurrentRequestState>;
}) => Promise<Omit<DashkitMetaDataItemBase, 'defaultParams'>>;

export const WidgetMetaContext = React.createContext<WidgetMetaContextValue | null>(null);

export interface MetaCallbackProviderProps {
    children: React.ReactNode;
}

export const WidgetMetaProvider: React.FC<MetaCallbackProviderProps> = ({children}) => {
    const callbacksRef = React.useRef<Map<string, LoadHiddenWidgetMetaCallbackType>>(new Map());

    const registerCallback = React.useCallback(
        (widgetId: string, callback: LoadHiddenWidgetMetaCallbackType) => {
            callbacksRef.current.set(widgetId, callback);
        },
        [],
    );

    const loadHiddenWidgetMeta = React.useCallback<LoadHiddenWidgetMetaType>(
        async ({subItemId, widgetId, silentRequestCancellationRef}) => {
            if (!widgetId || !subItemId) {
                return null;
            }

            const callback = callbacksRef.current.get(widgetId);

            if (callback) {
                return callback({subItemId, silentRequestCancellationRef});
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
            loadHiddenWidgetMeta,
            unregisterCallback,
            clearCallbacks,
            getRegisteredWidgetIds,
            hasRegisteredWidgetId,
        }),
        [
            registerCallback,
            loadHiddenWidgetMeta,
            unregisterCallback,
            clearCallbacks,
            getRegisteredWidgetIds,
            hasRegisteredWidgetId,
        ],
    );

    return <WidgetMetaContext.Provider value={contextValue}>{children}</WidgetMetaContext.Provider>;
};

export const useWidgetMetaContext = (): WidgetMetaContextValue | null => {
    const context = React.useContext(WidgetMetaContext);

    if (!context) {
        return null;
    }

    return context;
};
