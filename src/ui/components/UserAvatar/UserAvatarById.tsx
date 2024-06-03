import React from 'react';

import block from 'bem-cn-lite';

import type {UserAvatarByIdProps} from '../../registry/units/common/types/components/UserAvatarById';

import './UserAvatarById.scss';

const b = block('dl-user-avatar-by-id');

export const UserAvatarById = ({className, size}: UserAvatarByIdProps) => {
    return (
        <div className={className}>
            <div className={b('avatar', {size})}></div>
        </div>
    );
};
