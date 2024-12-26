import {DL} from 'constants/common';

import {Feature} from 'shared';
import Utils from 'utils';

export function getIsAsideHeaderEnabled() {
    if (DL.IS_MOBILE || DL.IS_NOT_AUTHENTICATED || DL.IS_AUTH_PAGE) {
        return false;
    }
    return Utils.isEnabledFeature(Feature.AsideHeaderEnabled);
}
