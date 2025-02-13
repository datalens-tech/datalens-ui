import React from 'react';

import {DL} from 'ui/constants';

import AccessErrorPage from '../AccessErrorPage/AccessErrorPage';

const CreateProfilePage = () => {
    if (!DL.IS_NATIVE_AUTH_ADMIN) {
        return <AccessErrorPage />;
    }

    return null;
};

export default CreateProfilePage;
