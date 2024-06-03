import type {AppContext} from '@gravity-ui/nodekit';
import merge from 'lodash/merge';

import type {FeatureConfig} from '../types';

export const getServerFeatures = (ctx: AppContext): FeatureConfig => {
    return merge({}, ctx.config.features, ctx.dynamicConfig?.features);
};

export const isEnabledServerFeature = (ctx: AppContext, feature: string) => {
    return getServerFeatures(ctx)[feature];
};
