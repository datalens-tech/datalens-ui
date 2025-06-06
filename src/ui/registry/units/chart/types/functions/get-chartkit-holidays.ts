export type ChartKitHolidays = {
    holiday: Record<string, Record<string, string>>;
    weekend: Record<string, Record<string, string>>;
};

export type GetChartkitHolidaysFn = () => ChartKitHolidays;
