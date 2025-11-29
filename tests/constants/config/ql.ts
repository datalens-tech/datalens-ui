import {QlUrls, QlQueries} from '../../constants/test-entities/ql';
import {QlParametrizationConfig} from '../../types/config/ql';

export const ql: QlParametrizationConfig = {
    urls: {
        NewQLChart: QlUrls.NewQLChart,
        NewQLChartWithConnection: QlUrls.NewQLChartWithConnection,
    },
    queries: {
        citySales: QlQueries.citySales,
        salesBySalesFloat: QlQueries.salesBySalesFloat,
        dateAndSales: QlQueries.dateAndSales,
        dateAndSalesModified: QlQueries.dateAndSalesModified,
    },
};
