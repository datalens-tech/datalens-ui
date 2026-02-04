import {AUTH_DEFAULT_COOKIE_NAME} from './constants/cookie';

const generateCookieName = ({
    authCookieName,
    postfix,
}: {
    authCookieName?: string;
    postfix?: string;
}) => {
    const baseCookieName = authCookieName || AUTH_DEFAULT_COOKIE_NAME;
    return baseCookieName + (postfix ? `_${postfix}` : '');
};

export const getAuthCookieName = (authCookieName?: string) => generateCookieName({authCookieName});
export const getAuthExpCookieName = (authCookieName?: string) =>
    generateCookieName({authCookieName, postfix: 'exp'});
