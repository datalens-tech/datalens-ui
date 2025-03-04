import {Signin} from 'ui/units/auth/components/Signin/Signin';
import {getUsersRoles} from 'ui/units/auth/utils/getUsersRoles';
import {getUsersListColumns} from 'ui/units/service-settings/components/UsersList/utils';

import {registry} from '../../index';

export const registerAuthPlugins = () => {
    registry.auth.functions.register({
        getUsersRoles,
        getUsersListColumns,
    });

    registry.auth.components.registerMany({
        Signin: Signin,
    });
};
