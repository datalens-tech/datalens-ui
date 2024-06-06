import React from 'react';

import type {LoaderProps as CommonLoaderProps} from '@gravity-ui/uikit';
import {Loader as CommonLoader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './Loader.scss';

const b = block('dash-loader');

export interface LoaderProps {
    size: CommonLoaderProps['size'];
    text?: string;
}

const Loader: React.FC<LoaderProps> = ({size = 'm', text}) => {
    return (
        <div className={b()}>
            <CommonLoader size={size} />
            {text ? <div className={b('text')}>{text}</div> : null}
        </div>
    );
};

export default Loader;
