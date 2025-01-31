import get from 'lodash/get';
import {DL} from 'ui/constants/common';

export const isEnabledFeature = (featureName: string) => {
    const featureDynamicStatus = get(DL.DYNAMIC_FEATURES, featureName);
    const featureStaticStatus = Boolean(get(DL.FEATURES, featureName));

    return featureDynamicStatus ?? featureStaticStatus;
};
