import React from 'react';

import type {ThemeType} from '@gravity-ui/uikit';
import {useThemeType} from '@gravity-ui/uikit';
import type {IconId} from 'shared';

import {IconById} from '../IconById/IconById';

type CollectionIconType = {
    size?: number;
    isIconBig?: boolean;
    className?: string;
};

const CollectionIcon: React.FC<CollectionIconType> = ({size = 32, isIconBig, className}) => {
    const theme = useThemeType();

    const collectionIcons: Record<ThemeType, IconId> = {
        light: isIconBig ? 'collectionColoredBig' : 'collectionColored',
        dark: isIconBig ? 'collectionColoredBigDark' : 'collectionColoredDark',
    };

    return <IconById className={className} id={collectionIcons[theme]} size={size} />;
};

export {CollectionIcon};
