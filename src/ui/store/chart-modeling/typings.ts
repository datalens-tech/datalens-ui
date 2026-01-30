import type {ChartStateSettings} from 'shared';

export type ChartWidgetState = ChartStateSettings & {widgetName?: string};

export type ChartModelingState = {
    /** the widget that is currently being edited (for which we show a dialog with settings) */
    editingWidgetId: string | undefined;
    widgets: Record<string, ChartWidgetState>;
};
