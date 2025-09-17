import type {ChartKitHolidays} from '../../../../../store/toolkit/chartkit/types';

export type GetChartkitHolidaysFn = () =>
    | ChartKitHolidays
    | Promise<ChartKitHolidays | undefined>
    | undefined;
