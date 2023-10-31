import React from 'react';

import block from 'bem-cn-lite';
import {IconId} from 'shared';
import {Utils} from 'ui';

import {IconById} from '../IconById/IconById';

type CollectionIconType = {
    size?: number;
    isIconBig?: boolean;
};

import './CollectionIcon.scss';

const b = block('collection-icon');

const CollectionIcon: React.FC<CollectionIconType> = ({size = 32, isIconBig}) => {
    const currentTheme = Utils.getCurrentTheme();

    const collectionIcons: {[key: string]: string} = {
        light: isIconBig ? 'collectionColoredBig' : 'collectionColored',
        dark: isIconBig ? 'collectionColoredBigDark' : 'collectionColoredDark',
        'light-hc': isIconBig ? 'collectionColoredBig' : 'collectionColored',
        'dark-hc': isIconBig ? 'collectionColoredBigDark' : 'collectionColoredDark',
    };

    return <IconById className={b()} id={collectionIcons[currentTheme] as IconId} size={size} />;
};

export {CollectionIcon};
