import React from 'react';

import {registry} from '../../../../registry';
import {MarkupItem} from '../../types';

interface UserInfoProps {
    userId?: string;
    fieldName?: MarkupItem['user_info'];
}

export const UserInfo: React.FC<UserInfoProps> = (props) => {
    const {userId, fieldName} = props;
    const {MarkupUserInfo} = registry.common.components.getAll();

    if (userId && fieldName) {
        return <MarkupUserInfo userId={userId} content={fieldName} />;
    }

    return null;
};
