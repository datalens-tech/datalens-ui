import React from 'react';

import {useThemeType} from '@gravity-ui/uikit';
import merge from 'lodash/merge';

import {AsyncImage} from '../AsyncImage/AsyncImage';

import {importContext, isContext} from './context';
import type {IllustrationComponent, IllustrationStore} from './types';

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

    function Illustration({name, ...props}: IllustrationComponent) {
        const theme = useThemeType();
        const src = store[theme] && store[theme][name];
        return <AsyncImage alt={name} src={src} showSkeleton={true} {...props} />;
    }

    return Illustration;
}
