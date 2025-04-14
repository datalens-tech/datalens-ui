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
    dateAndSales: `
        select date_part('year', order_date) as date_year, sales::float as sales
        from public.sales
        limit 10
    `,
    // Column that replaces sales should be less than date_year when comparing alphabetically
    dateAndSalesModified: `
        select date_part('year', order_date) as date_year, sales::float as average_sales
        from public.sales
        limit 10
    `,
};

export const QlQa = {
    visualizationList: [
        VisualizationsQa.BarXD3,
        VisualizationsQa.BarYD3,
        VisualizationsQa.ScatterD3,
        VisualizationsQa.PieD3,
        VisualizationsQa.DonutD3,
        VisualizationsQa.Metric,
        VisualizationsQa.FlatTable,
        VisualizationsQa.TreemapD3,
    ],
};
