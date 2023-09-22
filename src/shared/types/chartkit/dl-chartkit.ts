export type ChartsInsightsItemLevels = 'info' | 'warning' | 'critical';

export type ChartsInsightsItem = {
    level: ChartsInsightsItemLevels;
    title: string;
    message: string;
    locator: string;
};
