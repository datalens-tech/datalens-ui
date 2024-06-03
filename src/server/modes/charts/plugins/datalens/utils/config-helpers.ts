import type {ExtendedChartsConfig, ServerChartsConfig} from '../../../../../../shared';
import {mapChartsConfigToLatestVersion} from '../../../../../../shared';

export const mapChartsConfigToServerConfig = (
    config: ExtendedChartsConfig & {sharedData: ServerChartsConfig['sharedData']},
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
