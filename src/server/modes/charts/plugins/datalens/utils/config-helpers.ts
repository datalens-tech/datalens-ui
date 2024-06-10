import type {ExtendedChartsConfig, ServerChartsConfig} from '../../../../../../shared';
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
