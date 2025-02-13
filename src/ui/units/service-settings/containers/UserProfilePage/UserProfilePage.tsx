import React from 'react';

import {DL} from 'ui/constants/common';

import AccessErrorPage from '../AccessErrorPage/AccessErrorPage';

const UserProfilePage = () => {
    if (!DL.IS_NATIVE_AUTH_ADMIN) {
        return <AccessErrorPage />;
    }

    return null;
};

export default UserProfilePage;
