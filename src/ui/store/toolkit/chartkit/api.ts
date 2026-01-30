import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';

import {registry} from '../../../registry';

import type {ChartKitHolidays} from './types';

export const chartkitApi = createApi({
    reducerPath: 'chartkitApi',
    baseQuery: fetchBaseQuery({baseUrl: '/'}),
    endpoints: (builder) => ({
        getChartkitHolidaysAsync: builder.query<ChartKitHolidays | undefined, void>({
            async queryFn() {
                const {getChartkitHolidays} = registry.chart.functions.getAll();
                const holidays = await getChartkitHolidays();

                return {data: holidays};
            },
        }),
    }),
});

export const {useGetChartkitHolidaysAsyncQuery} = chartkitApi;
