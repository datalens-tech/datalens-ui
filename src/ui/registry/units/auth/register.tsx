import {getUsersRoles} from 'ui/units/auth/utils/getUsersRoles';

import {registry} from '../../index';

export const registerAuthPlugins = () => {
    registry.auth.functions.register({
        getUsersRoles,
    });
};
