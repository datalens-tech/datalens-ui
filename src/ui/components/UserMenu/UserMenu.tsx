import React from 'react';

import {ArrowRightFromSquare, Gear} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {Link} from 'react-router-dom';

import {DL} from '../../constants/common';

import {UserAvatar} from './UserAvatar';

import './UserMenu.scss';

const b = block('dl-user-menu');
const i18n = I18n.keyset('component.user-menu.view');
const i18nAsideHeader = I18n.keyset('component.aside-header.view');

export function UserMenu({onClose}: {onClose: () => void}) {
    const user = DL.USER;
    return (
        <div className={b()}>
            <div className={b('entry')}>
                <div className={b('entry-content')}>
                    <div className={b('user')}>
                        <UserAvatar className={b('user-avatar')} />
                        <div className={b('user-info')}>
                            <span className={b('user-name')} title={user.displayName}>
                                {user.displayName}
                            </span>
                            <span className={b('user-description')} title={user.email}>
                                {user.email}
                            </span>
                        </div>
                    </div>
                </div>
                <div className={b('entry-actions')}>
                    {DL.AUTH_ENABLED && (
                        <Link to="/profile">
                            <Button
                                view="flat-secondary"
                                className={b('entry-button')}
                                title={i18nAsideHeader('label_profile-settings')}
                                onClick={onClose}
                            >
                                <Icon data={Gear} size={18} />
                            </Button>
                        </Link>
                    )}
                    <Button
                        className={b('entry-button')}
                        title={i18n('label_logout')}
                        href={DL.AUTH_ENABLED ? '/auth/logout' : '/logout'}
                        view="flat-secondary"
                    >
                        <Icon data={ArrowRightFromSquare} size={18} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
