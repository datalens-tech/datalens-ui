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

type RunActivityEventHandler = {
    type: 'runActivity';
};

export type GoToEventHandler = {
    type: 'goTo';
    target?: '_self' | '_blank';
};

export type WidgetEventHandler =
    | SetActionParamsEventHandler
    | GoToEventHandler
    | RunActivityEventHandler;

export type GraphWidgetEventScope = 'point';

export type TableWidgetEventScope = 'row' | 'cell';

export type WidgetEvent<T> = {
    handler: WidgetEventHandler | WidgetEventHandler[];
    scope?: T;
};

export type GraphTooltipLine = {
    originalValue: number;
    seriesName: string;
    value: string;
};
