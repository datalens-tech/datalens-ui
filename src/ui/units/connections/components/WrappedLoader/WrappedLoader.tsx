import React from 'react';

import {Loader, LoaderProps} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {getIsAsideHeaderEnabled} from '../../../../components/AsideHeaderAdapter';

import './WrappedLoader.scss';

const b = block('wrapped-loader');

export const WrappedLoader: React.FC<LoaderProps> = (props) => {
    const {size = 'l'} = props;
    const isAsideHeaderEnabled = getIsAsideHeaderEnabled();

    return (
        <div className={b({'with-aside-header': isAsideHeaderEnabled})}>
            <Loader className={b()} size={size} />
        </div>
    );
};
