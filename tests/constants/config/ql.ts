import {QlUrls, QlQueries, QlQa} from 'constants/test-entities/ql';
import {QlParametrizationConfig} from 'types/config/ql';

export const ql: QlParametrizationConfig = {
    urls: {
        NewQLChart: QlUrls.NewQLChart,
        NewQLChartWithConnection: QlUrls.NewQLChartWithConnection,
    },
    queries: {
        citySales: QlQueries.citySales,
        salesBySalesFloat: QlQueries.salesBySalesFloat,
    },
    qa: {
        visualizationList: QlQa.visualizationList,
    },
};
