import React from 'react';

import type {ChartWidgetDataRef} from 'ui/components/Widgets/Chart/types';
import type {ChartsData} from 'ui/libs/DatalensChartkit/modules/data-provider/charts';
import type {Widget} from 'ui/libs/DatalensChartkit/types';

export type OnWidgetLoadDataHandler = (
    widgetId: string,
    loadedData: Widget & ChartsData,
    widgetDataRef: ChartWidgetDataRef,
) => void;

export type WidgetCallbacksContext = {
    onWidgetMountChange: (isMounted: boolean, id: string, domElement: HTMLElement) => void;
    onWidgetLoadData?: OnWidgetLoadDataHandler;
};

export const WidgetContext = React.createContext<WidgetCallbacksContext | null>(null);

export const WidgetContextProvider: React.FC<WidgetCallbacksContext> = (props) => {
    const contextValue = React.useMemo(
        () => ({
            onWidgetMountChange: props.onWidgetMountChange,
            onWidgetLoadData: props.onWidgetLoadData,
        }),
        [props.onWidgetMountChange, props.onWidgetLoadData],
    );

    return <WidgetContext.Provider value={contextValue}>{props.children}</WidgetContext.Provider>;
};

export const useWidgetContext = ({
    id,
    elementRef,
}: {
    id: string;
    elementRef: React.RefObject<HTMLElement | null>;
}) => {
    const context = React.useContext(WidgetContext);
    const onMountChange = context?.onWidgetMountChange;
    const onWidgetLoadData = context?.onWidgetLoadData;

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

    return {onWidgetLoadData};
};
