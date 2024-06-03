import React from 'react';

import {MobileHeader} from '@gravity-ui/navigation';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {PRODUCT_NAME} from 'ui/constants';
import type {MobileHeaderComponentProps} from 'ui/registry/units/common/types/components/MobileHeaderComponent';

import {BurgerMenuFooter} from './BurgerMenuFooter/BurgerMenuFooter';

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

export const MobileHeaderComponent = ({renderContent}: MobileHeaderComponentProps) => {
    return (
        <MobileHeader
            logo={{
                icon: logoIcon,
                text: PRODUCT_NAME,
                iconClassName: b('logo-icon'),
            }}
            burgerMenu={{items: menuItems, renderFooter: () => <BurgerMenuFooter />}}
            contentClassName={b('content')}
            className={b('container')}
            renderContent={renderContent}
        />
    );
};
