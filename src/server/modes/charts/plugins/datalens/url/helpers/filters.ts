import type {PayloadFilter} from '../../../../../../../shared';

type GetMergedChartAndParamsFiltersArgs = {
    paramsFilters: PayloadFilter[];
    chartFilters: PayloadFilter[];
};

export const getMergedChartAndParamsFilters = (
    args: GetMergedChartAndParamsFiltersArgs,
): PayloadFilter[] => {
    const {chartFilters, paramsFilters} = args;

    const paramsFiltersMap = paramsFilters.reduce(
        (acc, paramFilter) => {
            acc[paramFilter.column] = true;

            return acc;
        },
        {} as Record<string, boolean>,
    );

    const filteredChartFilters = chartFilters.filter((chartFilter) => {
        return !paramsFiltersMap[chartFilter.column];
    });

    return [...filteredChartFilters, ...paramsFilters];
};
