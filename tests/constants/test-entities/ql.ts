import {VisualizationsQa} from '../../../src/shared/constants/qa/visualization';

export const enum QlUrls {
    NewQLChart = '/workbooks/3h42l91yd2lgs/ql',
    NewQLChartWithConnection = '/workbooks/3h42l91yd2lgs/ql?connectionId=dr0y3yyi1gjk2',
}

export const QlQueries = {
    citySales: `
        select city, sales::float
        from public.sales
        limit 10
    `,
    salesBySalesFloat: `
        select sales::float, sales::float as sales_copy
        from public.sales
        limit 10
    `,
};

export const QlQa = {
    visualizationList: [
        VisualizationsQa.BarD3,
        VisualizationsQa.ScatterD3,
        VisualizationsQa.PieD3,
        VisualizationsQa.DonutD3,
        VisualizationsQa.Metric,
        VisualizationsQa.FlatTable,
    ],
};
