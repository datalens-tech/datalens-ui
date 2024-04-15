import type {StringParams} from 'shared';

import type {DrillDownConfig} from '../../../../../types';

type GetDrillDownOptionsArgs = {
    params: StringParams;
    config: DrillDownConfig | undefined;
};

export function getDrillDownOptions(args: GetDrillDownOptionsArgs) {
    const {params, config} = args;

    const drillDownLevel = Number((params.drillDownLevel || ['0'])[0]);
    const breadcrumbsLength = config?.breadcrumbs.length;

    return {
        enabled: !breadcrumbsLength || drillDownLevel !== breadcrumbsLength - 1,
        level: drillDownLevel,
        filters: (params.drillDownFilters as string[]) || new Array(breadcrumbsLength).fill(''),
    };
}
