export type ChartsInsightsItemLevels = 'info' | 'warning' | 'critical';

export type ChartsInsightsItem = {
    level: ChartsInsightsItemLevels;
    title: string;
    message: string;
    locator: string;
};

type SetActionParamsEventHandler = {
    type: 'setActionParams';
};

type GoToEventHandler = {
    type: 'goTo';
    url?: string;
};

export type WidgetEventHandler = SetActionParamsEventHandler | GoToEventHandler;

export type GraphWidgetEventScope = 'point';

export type TableWidgetEventScope = 'row' | 'cell';

export type WidgetEvent<T> = {
    handler: WidgetEventHandler | WidgetEventHandler[];
    scope?: T;
};
