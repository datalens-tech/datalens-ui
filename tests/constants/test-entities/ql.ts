export const enum QlUrls {
    NewQLChart = '/workbooks/3h42l91yd2lgs/ql',
    NewQLChartWithConnection = '/workbooks/3h42l91yd2lgs/ql?connectionId=dr0y3yyi1gjk2',
}

export const QlQueries = {
    citySales: `
        select city, sales::float
        from public.sales
        group by city, sales
        limit 10
    `,
};
