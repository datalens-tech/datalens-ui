import React from 'react';

import {Skeleton} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {DL} from 'ui/constants';
import type {LoginByIdProps} from 'ui/registry/units/common/types/components/LoginById';

import {useUserById} from '../../hooks/useUserById';

import './LoginById.scss';

const b = block('dl-login-by-id');

export const LoginById = ({loginOrId, className, view = 'primary'}: LoginByIdProps) => {
    const user = useUserById(loginOrId);

    if (!DL.AUTH_ENABLED) {
        return null;
    }

    let node: React.ReactNode = null;

    if (user.status === 'loading') {
        node = <Skeleton className={b('skeleton')} />;
    } else {
        node = <span title={user.title}>{user.title}</span>;
    }
    return <div className={b({view}, className)}>{node}</div>;
};
