import type {AppContext} from '@gravity-ui/nodekit';
import merge from 'lodash/merge';

import type {FeatureConfig} from '../types';

/**
 * @deprecated You should use ctx.get('getServerFeatures') instead
 */
export const getServerFeatures = (ctx: AppContext): FeatureConfig => {
    return merge({}, ctx.config.features, ctx.dynamicConfig?.features);
};

export const getServerFeaturesWithBoundContext = (ctx: AppContext): (() => FeatureConfig) => {
    return () => merge({}, ctx.config.features, ctx.dynamicConfig?.features);
};

/**
 * @deprecated You should use ctx.get('isEnabledServerFeature') instead
 */
export const isEnabledServerFeature = (ctx: AppContext, feature: string) => {
    return getServerFeatures(ctx)[feature];
};

export const getEnabledServerFeatureWithBoundContext = (ctx: AppContext) => {
    return (feature: string) => ctx.get('getServerFeatures')()[feature];
};
