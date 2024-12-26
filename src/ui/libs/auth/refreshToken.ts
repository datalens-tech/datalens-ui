import {AUTH_EXP_COOKIE_NAME} from '../../../shared/components/auth/constants/cookie';
import {ACCESS_TOKEN_TIME_RESERVE} from '../../../shared/components/auth/constants/token';
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
        const exp = Number(Utils.getCookie(AUTH_EXP_COOKIE_NAME));
        const now = Math.floor(new Date().getTime() / 1000);

        if (!exp || now + ACCESS_TOKEN_TIME_RESERVE > exp) {
            refreshPromise = getRefreshPromise();
            await refreshPromise;
        }
    }
};
