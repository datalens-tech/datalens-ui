import _get from 'lodash/get';
import {DL} from 'ui/constants/common';

export const isEnabledFeature = (featureName: string) => {
    const featureDynamicStatus = _get(DL.DYNAMIC_FEATURES, featureName);

    if (typeof featureDynamicStatus !== 'undefined') {
        return featureDynamicStatus;
    }

    return Boolean(_get(DL.FEATURES, featureName));
};
