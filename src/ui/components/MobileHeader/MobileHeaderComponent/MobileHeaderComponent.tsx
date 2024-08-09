import React from 'react';

import type {MobileHeaderProps} from '@gravity-ui/navigation';
import {MobileHeader, getMobileHeaderCustomEvent} from '@gravity-ui/navigation';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {PRODUCT_NAME} from 'ui/constants';
import type {MobileHeaderComponentProps} from 'ui/registry/units/common/types/components/MobileHeaderComponent';

import {DL} from '../../../constants/common';
import {UserAvatar} from '../../UserMenu/UserAvatar';

import {BurgerMenuFooter} from './BurgerMenuFooter/BurgerMenuFooter';
import {UserPanel} from './UserPanel/UserPanel';

import logoIcon from 'ui/assets/icons/logo.svg';
import iconCollection from 'ui/assets/icons/mono-collection.svg';

import '../MobileHeader.scss';

const i18n = I18n.keyset('component.aside-header.view');

const b = block('mobile-header');

const menuItems = [
    {
        id: 'collections',
        title: i18n('switch_collections'),
        icon: iconCollection,
        link: '/collections',
        closeMenuOnClick: true,
    },
];

enum Panel {
    User = 'user',
}

export const MobileHeaderComponent = ({renderContent}: MobileHeaderComponentProps) => {
    const ref = React.useRef<HTMLDivElement>(null);

    const sideItem = (
        <div
            onClick={() => {
                ref.current?.dispatchEvent(
                    getMobileHeaderCustomEvent('MOBILE_PANEL_TOGGLE', {panelName: Panel.User}),
                );
            }}
        >
            <UserAvatar className={b('user-avatar')} />
        </div>
    );

    const panelItems: MobileHeaderProps['panelItems'] = DL.ZITADEL_ENABLED
        ? [
              {
                  id: Panel.User,
                  content: <UserPanel />,
                  direction: 'right',
              },
          ]
        : undefined;

    return (
        <MobileHeader
            ref={ref}
            logo={{
                icon: logoIcon,
                text: PRODUCT_NAME,
                iconClassName: b('logo-icon'),
            }}
            burgerMenu={{items: menuItems, renderFooter: () => <BurgerMenuFooter />}}
            contentClassName={b('content')}
            className={b('container')}
            renderContent={renderContent}
            sideItemRenderContent={() => sideItem}
            panelItems={panelItems}
        />
    );
};
