import {DL} from 'ui/constants/common';

export function getCurrentUserRights() {
    if (!DL.AUTH_ENABLED) {
        return {
            admin: true,
        };
    }

    return {
        admin: Boolean(DL.IS_NATIVE_AUTH_ADMIN),
    };
}
