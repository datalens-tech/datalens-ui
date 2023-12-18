import type {QlConfigV2} from '../../../../types/config/ql/v2';
import type {QlConfigV3} from '../../../../types/config/ql/v3';
import {QlConfigVersions} from '../../../../types/ql/versions';

export const mapV2ConfigToV3 = (config: QlConfigV2): QlConfigV3 => {
    return {
        ...config,
        colors: config.colors || [],
        labels: config.labels || [],
        shapes: config.shapes || [],
        tooltips: config.tooltips || [],
        version: QlConfigVersions.V3,
    };
};
