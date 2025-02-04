import {DL} from 'constants/common';

import {Feature} from 'shared';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

export function getIsAsideHeaderEnabled() {
    if (DL.IS_MOBILE || DL.IS_NOT_AUTHENTICATED || DL.IS_AUTH_PAGE) {
        return false;
    }
    return isEnabledFeature(Feature.AsideHeaderEnabled);
}
