import logger from '../../../../libs/logger';
import {getSdk} from '../../../../libs/schematic-sdk';
import type {AppDispatch} from '../../../../store';
import {AUTH_ROUTE} from '../../constants/routes';

export const logout = () => {
    return (_dispatch: AppDispatch) => {
        const {sdk} = getSdk();
        return sdk.auth.auth
            .logout()
            .then(() => {
                window.location.href = AUTH_ROUTE.SIGNIN;
                return {error: null};
            })
            .catch((error) => {
                if (!sdk.isCancel(error)) {
                    logger.logError('auth/logout failed', error);

                    return {error: error as Error};
                }
                return {error: null};
            });
    };
};
