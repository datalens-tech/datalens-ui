import cloneDeepWith from 'lodash/cloneDeepWith';

import type {
    DATASET_FIELD_TYPES,
    ExtendedChartsConfig,
    ServerChartsConfig,
    ServerField,
} from '../../../../../../shared';
import {mapChartsConfigToLatestVersion} from '../../../../../../shared';

export type MapChartsConfigToServerConfigArgs = ExtendedChartsConfig & {
    sharedData: ServerChartsConfig['sharedData'];
};

export const mapChartsConfigToServerConfig = (
    config: MapChartsConfigToServerConfigArgs,
): ServerChartsConfig => {
    const latestConfig = mapChartsConfigToLatestVersion(config, {
        sharedData: config.sharedData || {},
    });

    const serverConfig: ServerChartsConfig = {
        ...latestConfig,
        sharedData: config.sharedData || {},
        // Fallback for old charts (where there are no links)
        links: latestConfig.links || [],
    };

    return serverConfig;
};

function isField(value: unknown): value is ServerField {
    return typeof value === 'object' && 'guid' in value;
}

export function getConfigWithActualFieldTypes(args: {
    config: ServerChartsConfig;
    idToDataType: Record<string, DATASET_FIELD_TYPES>;
}) {
    const {config, idToDataType} = args;

    return cloneDeepWith(config, function (value: undefined) {
        if (isField(value)) {
            const dataType = idToDataType[value.guid] ?? value.data_type;
            const field: ServerField = {...value, data_type: dataType};
            return field;
        }
    });
}
