export type DashParametrizationConfig = {
    urls: {
        DashboardWithLongContentBeforeChart: string;
        DashboardLoadPriorityCharts: string;
        DashboardLoadPrioritySelectors: string;
        DashboardWithTabsAndSelectors: string;
        DashboardMoreThan100Revisions: string;
        DashboardWithErrorChart: string;
        DashboardWithAPIErrorChart: string;
    };
    endpoints: {
        createDash: string;
    };
};
