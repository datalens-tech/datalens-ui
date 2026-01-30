import {DL} from 'ui/constants/common';

export const getUsersRoles = () => {
    return DL.ORDERED_AUTH_ROLES || [];
};
