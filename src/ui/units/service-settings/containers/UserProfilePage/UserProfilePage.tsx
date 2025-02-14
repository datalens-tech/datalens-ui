import React from 'react';

import {DL} from 'ui/constants/common';
import UserPage from 'ui/datalens/pages/UserProfilePage/UserProfilePage';

import AccessErrorPage from '../AccessErrorPage/AccessErrorPage';

const UserProfilePage = () => {
    if (!DL.IS_NATIVE_AUTH_ADMIN) {
        return <AccessErrorPage />;
    }

    return <UserPage context="another" />;
};

export default UserProfilePage;
