import type {SchemasByScope} from '@gravity-ui/gateway';
import type {NodeKit} from '@gravity-ui/nodekit';

import {isEnabledServerFeature} from '../../../../shared';
import type {PublicApiBaseConfig, PublicApiVersion} from '../types';

export const preparePublicApiBaseConfig = <TSchema extends SchemasByScope, TFeature extends string>(
    nodekit: NodeKit,
    config: PublicApiBaseConfig<TSchema, TFeature>,
): PublicApiBaseConfig<TSchema, TFeature> => {
    const result = {} as PublicApiBaseConfig<TSchema, TFeature>;

    for (const [versionKey, versionConfig] of Object.entries(config)) {
        const version = versionKey as `${PublicApiVersion}`;
        const {actions, openApi} = versionConfig;

        const filteredActions = Object.fromEntries(
            Object.entries(actions).filter(([, action]) => {
                return (
                    !action.features ||
                    action.features.every((feature) => isEnabledServerFeature(nodekit.ctx, feature))
                );
            }),
        );

        result[version] = {
            actions: filteredActions,
            openApi,
        };
    }

    return result;
};
