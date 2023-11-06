import {mapQlConfigToLatestVersion} from '../../../../../shared/modules/config/ql';
import type {QlConfig} from '../../../../../shared/types/config/ql';
import {buildD3Config as buildD3CommonConfig} from '../datalens/d3';

export function buildD3Config({shared}: {shared: QlConfig}) {
    return buildD3CommonConfig(mapQlConfigToLatestVersion(shared));
}
