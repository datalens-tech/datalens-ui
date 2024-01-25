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
    endpoints: DashConfigEndpoints;
};

export type DashConfigEndpoints = {
    createDash: string;
    navigationPage: string;
};
