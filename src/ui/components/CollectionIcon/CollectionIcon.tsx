import React from 'react';

import {useThemeType} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {IconId} from 'shared';

import {IconById} from '../IconById/IconById';

type CollectionIconType = {
    size?: number;
    isIconBig?: boolean;
};

import './CollectionIcon.scss';

const b = block('collection-icon');

const CollectionIcon: React.FC<CollectionIconType> = ({size = 32, isIconBig}) => {
    const theme = useThemeType();

    const collectionIcons: {[key: string]: string} = {
        light: isIconBig ? 'collectionColoredBig' : 'collectionColored',
        dark: isIconBig ? 'collectionColoredBigDark' : 'collectionColoredDark',
    };

    return <IconById className={b()} id={collectionIcons[theme] as IconId} size={size} />;
};

export {CollectionIcon};
