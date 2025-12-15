import type {SdkOptions} from 'ui/libs/schematic-sdk';
import {initSdk} from 'ui/libs/schematic-sdk';
import {registry} from 'ui/registry';

export type LibsPluginsConfig = {
    sdk?: SdkOptions & {
        allowOverride?: boolean;
    };
};

export const registryLibsPlugins = (options: LibsPluginsConfig = {}) => {
    registry.libs.schematicSdk.register(
        initSdk(options.sdk ?? {}),
        options.sdk?.allowOverride ?? false,
    );
};
