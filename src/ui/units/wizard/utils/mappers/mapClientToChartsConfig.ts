import pick from 'lodash/pick';
import type {
    ChartsConfig,
    ClientChartsConfig,
    FilterField,
    ServerChartsConfig,
    ServerFilter,
    ServerSort,
    Sort,
} from 'shared';

const mapFiltersToServerFilters = (filters: FilterField[]): ServerFilter[] => {
    return filters
        .filter((filter) => !filter.unsaved)
        .map<ServerFilter>((filter) => {
            const serverFilterKeys: Array<keyof ServerFilter> = [
                'guid',
                'datasetId',
                'filter',
                'fakeTitle',
                'originalTitle',
                'type',
                'title',
                'calc_mode',
            ];

            return pick(filter, serverFilterKeys);
        });
};
const mapSortToServerSort = (sort: Sort[]): ServerSort[] => {
    return sort.map<ServerSort>((sortItem) => {
        const serverSortKeys: Array<keyof ServerSort> = [
            'guid',
            'datasetId',
            'fakeTitle',
            'originalTitle',
            'data_type',
            'title',
            'source',
            'direction',
            'format',
            'type',
        ];

        return pick(sortItem, serverSortKeys);
    });
};

export function mapClientConfigToChartsConfig(config?: {shared: ClientChartsConfig}): ChartsConfig {
    if (!config) {
        return {} as ServerChartsConfig;
    }

    const configForSaving = config.shared;

    const filters = mapFiltersToServerFilters(configForSaving.filters || []);
    const sort = mapSortToServerSort(configForSaving.sort || []);

    return {
        ...configForSaving,
        filters,
        sort,
    };
}
