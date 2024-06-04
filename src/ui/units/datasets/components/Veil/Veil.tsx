import React from 'react';

import type {LoaderProps} from '@gravity-ui/uikit';
import {Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './Veil.scss';

const b = block('ds-veil');
const loaderDefaultProps: VeilProps['loader'] = {
    className: '',
    size: 'm',
    show: true,
};

interface VeilProps {
    className?: string;
    loader?: {show: boolean} & LoaderProps;
}

const getLoaderConfig = (loaderProps?: LoaderProps) => {
    if (!loaderProps) {
        return loaderDefaultProps;
    }

    return {
        ...loaderDefaultProps,
        ...loaderProps,
    };
};

const Veil: React.FC<VeilProps> = (props) => {
    const {className, loader} = props;
    const loaderConfig = getLoaderConfig(loader);

    return (
        <div className={b(null, className)}>
            {loaderConfig.show && (
                <Loader className={b('loader', loaderConfig.className)} size={loaderConfig.size} />
            )}
        </div>
    );
};

export default Veil;
