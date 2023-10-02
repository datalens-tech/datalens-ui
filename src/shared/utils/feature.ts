import {AppContext} from '@gravity-ui/nodekit';

export const isEnabledServerFeature = (ctx: AppContext, feature: string) => {
    const featureDynamicStatus = ctx.dynamicConfig?.features?.[feature];

    if (typeof featureDynamicStatus !== 'undefined') {
        return featureDynamicStatus;
    }

    return ctx.config.features[feature];
};
