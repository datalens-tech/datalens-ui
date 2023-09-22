const UID_PREFIX = 'uid:';

export const makeUserId = (userId: string) => `uid:${userId}`;

export const getUserId = (userIdWithPrefix: string) => userIdWithPrefix.slice(UID_PREFIX.length);

export const isUserId = (userIdOrLogin = '') => userIdOrLogin.startsWith(UID_PREFIX);

export const filterUsersIds = (ids: string[]) => ids.filter(isUserId).map(getUserId);
