import React from 'react';

import type {LoaderProps} from '@gravity-ui/uikit';
import {Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {getIsAsideHeaderEnabled} from '../../../../components/AsideHeaderAdapter';

import './WrappedLoader.scss';

const b = block('wrapped-loader');

type Props = LoaderProps & {withHeightOffset?: boolean};

export const WrappedLoader = (props: Props) => {
    const {size = 'l', withHeightOffset = true} = props;
    const mods = {
        'with-aside-header': getIsAsideHeaderEnabled(),
        'with-height-offset': withHeightOffset,
    };

    return (
        <div className={b(mods)}>
            <Loader size={size} />
        </div>
    );
};
