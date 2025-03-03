import React from 'react';

import {useThemeType} from '@gravity-ui/uikit';
import merge from 'lodash/merge';

import {SvgImage} from './SvgImage/SvgImage';
import {importContext, isContext} from './context';
import type {IllustrationName, IllustrationProps, IllustrationStore} from './types';

export function createIllustration<IKey extends string = IllustrationName>(
    items: Array<__WebpackModuleApi.RequireContext | IllustrationStore<IKey>> = [],
) {
    const getCustomStores = items.map((item) => {
        if (isContext(item)) {
            return importContext(item);
        } else {
            return item;
        }
    });
    const store: IllustrationStore<IKey> = merge({}, ...getCustomStores);

    function Illustration({name, ...props}: IllustrationProps<IKey>) {
        const theme = useThemeType();
        const src = store[theme] && store[theme][name];
        if (src?.type === 'lazy-component') {
            const Component = src.value;
            return <Component />;
        }
        return src ? <SvgImage alt={name} src={src.value} {...props} /> : null;
    }
    return Illustration;
}
