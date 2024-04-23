import {AppContext} from '@gravity-ui/nodekit';
import merge from 'lodash/merge';

export const getServerFeatures = (ctx: AppContext) => {
    return merge({}, ctx.config.features, ctx.dynamicConfig?.features);
};

export const isEnabledServerFeature = (ctx: AppContext, feature: string) => {
    return getServerFeatures(ctx)[feature];
};
