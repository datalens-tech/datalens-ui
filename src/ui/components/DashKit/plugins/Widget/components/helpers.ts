import {DASH_WIDGET_TYPES} from 'ui/units/dash/modules/constants';

export const DASH_WIDGET_CLASSNAME = 'dashkit-plugin-widget';

export const isWidgetTypeWithAutoHeight = (widgetType: string) => {
    return (
        widgetType === DASH_WIDGET_TYPES.TABLE ||
        widgetType === DASH_WIDGET_TYPES.MARKDOWN ||
        widgetType === DASH_WIDGET_TYPES.METRIC
    );
};

export const isWidgetTypeDoNotNeedOverlay = (widgetType: string) => {
    return (
        widgetType === DASH_WIDGET_TYPES.TABLE ||
        widgetType === DASH_WIDGET_TYPES.MARKDOWN ||
        widgetType === DASH_WIDGET_TYPES.TEXT ||
        widgetType === DASH_WIDGET_TYPES.CONTROL ||
        widgetType === DASH_WIDGET_TYPES.METRIC ||
        // delete after closing CHARTS-5818
        widgetType === DASH_WIDGET_TYPES.TIMESERIES
    );
};
