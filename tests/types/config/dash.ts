type ChartConfig = {
    name: string;
    url: string;
};

export type DashParametrizationConfig = {
    urls: {
        DashboardWithLongContentBeforeChart: string;
        DashboardLoadPriorityCharts: string;
        DashboardLoadPrioritySelectors: string;
        DashboardWithTabsAndSelectors: string;
        DashboardMoreThan100Revisions: string;
        DashboardWithErrorChart: string;
        DashboardWithAPIErrorChart: string;
        DashboardWithDifferentWidgets: string;
    };
    charts: {
        ChartCityPie: ChartConfig;
        ChartCityTable: ChartConfig;
    };
};
