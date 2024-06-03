import React from 'react';

import type {ThemeType} from '@gravity-ui/uikit';
import {useThemeType} from '@gravity-ui/uikit';
import type {IconId} from 'shared';

import {IconById} from '../IconById/IconById';

type CollectionIconType = {
    size?: number;
    isIconBig?: boolean;
};

const CollectionIcon: React.FC<CollectionIconType> = ({size = 32, isIconBig}) => {
    const theme = useThemeType();

    const collectionIcons: Record<ThemeType, IconId> = {
        light: isIconBig ? 'collectionColoredBig' : 'collectionColored',
        dark: isIconBig ? 'collectionColoredBigDark' : 'collectionColoredDark',
    };

    return <IconById id={collectionIcons[theme]} size={size} />;
};

export {CollectionIcon};
