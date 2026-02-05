import {ACCESS_TOKEN_TIME_RESERVE} from '../../../shared/components/auth/constants/token';
import {getAuthExpCookieName} from '../../../shared/components/auth/utils';
import {DL} from '../../constants/common';
import {registry} from '../../registry';
import Utils from '../../utils/utils';
import type {DatalensSdk, TypedSchema} from '../schematic-sdk';

let refreshPromise: Promise<unknown> | undefined;

const getRefreshPromise = () => {
    const sdk = registry.libs.schematicSdk.get() as DatalensSdk<TypedSchema>;
    return sdk.auth.auth
        .refreshTokens()
        .catch(() => {})
        .finally(() => {
            refreshPromise = undefined;
        });
};

export const refreshAuthToken = async () => {
    if (refreshPromise) {
        await refreshPromise;
    } else {
        const authExpCookieName = getAuthExpCookieName(DL.AUTH_COOKIE_NAME);
        const exp = Number(Utils.getCookie(authExpCookieName));
        const now = Math.floor(new Date().getTime() / 1000);

        if (!exp || now + ACCESS_TOKEN_TIME_RESERVE > exp) {
            refreshPromise = getRefreshPromise();
            await refreshPromise;
        }
    }
};
