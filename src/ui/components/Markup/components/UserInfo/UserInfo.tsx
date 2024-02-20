import React from 'react';

import {registry} from '../../../../registry';

interface UserInfoProps {
    className?: string;
    userId?: string;
    fieldName?: 'name' | 'email';
}

export const UserInfo: React.FC<UserInfoProps> = (props) => {
    const {userId, fieldName} = props;
    const {MarkupUserInfo} = registry.common.components.getAll();

    if (userId && fieldName) {
        return <MarkupUserInfo userId={userId} content={fieldName} />;
    }

    return null;
};
