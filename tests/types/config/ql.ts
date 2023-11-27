export type QlParametrizationConfig = {
    urls: {
        NewQLChart: string;
        NewQLChartWithConnection: string;
    };
    queries: {
        citySales: string;
        salesBySalesFloat: string;
    };
    qa: {
        visualizationList: string[];
    };
};
