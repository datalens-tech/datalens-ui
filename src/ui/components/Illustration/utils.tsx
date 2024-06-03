import React from 'react';

import {useThemeType} from '@gravity-ui/uikit';
import merge from 'lodash/merge';

import {SvgImage} from './SvgImage/SvgImage';
import {importContext, isContext} from './context';
import type {CreateIllustrationProps, IllustrationStore} from './types';

export function createIllustration(
    items: Array<__WebpackModuleApi.RequireContext | IllustrationStore> = [],
) {
    const getCustomStores = items.map((item) => {
        if (isContext(item)) {
            return importContext(item);
        } else {
            return item;
        }
    });
    const store: IllustrationStore = merge({}, ...getCustomStores);

    function Illustration({name, ...props}: CreateIllustrationProps) {
        const theme = useThemeType();
        const src = store[theme] && store[theme][name];
        return <SvgImage alt={name} src={src} {...props} />;
    }

    return Illustration;
}
