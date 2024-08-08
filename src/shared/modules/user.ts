const UID_PREFIX = 'uid:';
const ANONYMOUS_USER_PREFIX = '__ANONYMOUS';

export const makeUserId = (userId: string) => `uid:${userId}`;

export const getUserId = (userIdWithPrefix: string) => userIdWithPrefix.slice(UID_PREFIX.length);

export const isUserId = (userIdOrLogin = '') => {
    return userIdOrLogin.startsWith(UID_PREFIX) && !userIdOrLogin.includes(ANONYMOUS_USER_PREFIX);
};

export const filterUsersIds = (ids: string[]) => ids.filter(isUserId).map(getUserId);
