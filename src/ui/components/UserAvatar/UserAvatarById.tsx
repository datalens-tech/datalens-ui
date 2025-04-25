import React from 'react';

import {Popover} from '@gravity-ui/uikit';
import {DL} from 'ui/constants';
import {LoginById} from 'ui/units/auth/components/LoginById/LoginById';

import type {UserAvatarByIdProps} from '../../registry/units/common/types/components/UserAvatarById';
import {UserAvatar} from '../UserMenu/UserAvatar';

export const UserAvatarById = ({className, size, loginOrId}: UserAvatarByIdProps) => {
    const renderContent = () => {
        if (!DL.AUTH_ENABLED) {
            return <UserAvatar size={size} />;
        }

        return (
            <Popover
                placement="bottom"
                hasArrow={false}
                delayClosing={100}
                content={<LoginById loginOrId={loginOrId} view="primary" />}
            >
                <UserAvatar size={size} />
            </Popover>
        );
    };
    return <div className={className}>{renderContent()}</div>;
};
