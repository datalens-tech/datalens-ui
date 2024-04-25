import {i18n} from 'i18n';
import {Field, FilterField} from 'shared';

type GetChartFiltersWithDisabledProp = {
    dashboardFilters: Field[];
    chartFilters: FilterField[];
};

export const getChartFiltersWithDisabledProp = ({
    dashboardFilters,
    chartFilters,
}: GetChartFiltersWithDisabledProp): FilterField[] => {
    const filtersFieldsMap = dashboardFilters.reduce(
        (acc, dashboardFilter) => {
            acc[dashboardFilter.guid] = true;
            return acc;
        },
        {} as Record<string, boolean>,
    );

    // We set the disabled flag to filters that are overlaid with filters from the dashboard
    return chartFilters.map((chartFilter) => {
        if (filtersFieldsMap[chartFilter.guid]) {
            return {
                ...chartFilter,
                disabled: i18n('wizard', 'tooltip_filter_item'),
            };
        }

        return chartFilter;
    });
};
