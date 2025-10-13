import React from 'react';

import {ArrowRightFromSquare} from '@gravity-ui/icons';
import {Divider, Icon, Menu} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import {DL} from '../../../../constants/common';
import {UserAvatar} from '../../../UserMenu/UserAvatar';

import './UserPanel.scss';

const b = block('dl-mobile-header-user-panel');

const i18n = I18n.keyset('component.aside-header.view');

export const UserPanel = () => {
    const user = DL.USER;
    return (
        <div className={b()}>
            <div className={b('user')}>
                <UserAvatar size="l" className={b('user-avatar')} />
                <div className={b('user-info')}>
                    <span className={b('user-name')} title={user.displayName}>
                        {user.displayName}
                    </span>
                    <span className={b('user-description')} title={user.email}>
                        {user.email}
                    </span>
                </div>
            </div>
            <Divider orientation="horizontal" />
            <Menu>
                <Menu.Item key="logout" href="/auth/logout" className={b('menu-item')}>
                    <Icon data={ArrowRightFromSquare} size={20} className={b('menu-icon')} />
                    {i18n('label_logout')}
                </Menu.Item>
            </Menu>
        </div>
    );
};
