import React from 'react';

import type {IconData} from '@gravity-ui/uikit';
import {Icon, Link, Text} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import miniLogo from 'ui/assets/icons/mini-monochrome-logo.svg';

import './BottomDecoration.scss';

const b = block('aside-header-bottom-decoration');

const BOTTOM_TEXT = 'Powered by Yandex DataLens';
const PROMO_LINK = 'https://datalens.ru';

export const BottomDecoration = ({
    logo = miniLogo,
    compact,
}: {
    logo?: IconData;
    compact: boolean;
}) => {
    return (
        <Link className={b()} href={PROMO_LINK} target="_blank">
            {compact ? (
                <Icon data={logo} size={14} />
            ) : (
                <Text className={b('text')}>{BOTTOM_TEXT}</Text>
            )}
        </Link>
    );
};
