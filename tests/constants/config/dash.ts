import {DashUrls} from '../../constants/test-entities/dash';
import {DashParametrizationConfig} from '../../types/config/dash';
import {ChartsParams} from '../test-entities/charts';

export const dash: DashParametrizationConfig = {
    dashUrls: {
        DashboardWithLongContentBeforeChart: DashUrls.DashboardWithLongContentBeforeChart,
        DashboardLoadPriorityCharts: DashUrls.DashboardLoadPriorityCharts,
        DashboardLoadPrioritySelectors: DashUrls.DashboardLoadPrioritySelectors,
        DashboardWithTabsAndSelectors: DashUrls.DashboardWithTabsAndSelectors,
        DashboardMoreThan100Revisions: DashUrls.DashboardMoreThan100Revisions,
        DashboardWithErrorChart: DashUrls.DashboardWithErrorChart,
        DashboardWithAPIErrorChart: DashUrls.DashboardWithAPIErrorChart,
    },
    charts: {
        ChartCityPie: ChartsParams.ChartCityPie,
        ChartCityTable: ChartsParams.ChartCityTable,
    },
};
