import {Signin} from 'ui/units/auth/components/Signin/Signin';
import {getUsersRoles} from 'ui/units/auth/utils/getUsersRoles';

import {registry} from '../../index';

export const registerAuthPlugins = () => {
    registry.auth.functions.register({
        getUsersRoles,
    });

    registry.auth.components.registerMany({
        Signin: Signin,
    });
};
