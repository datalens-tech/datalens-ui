import React from 'react';

import type {LoaderProps} from '@gravity-ui/uikit';
import {Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './SmartLoader.scss';

const b = block('dl-smart-loader');

export type SmartLoaderProps = {
    size?: LoaderProps['size'];
    showAfter?: number;
    className?: string;
};

export const SmartLoader = ({size = 'm', showAfter = 500, className}: SmartLoaderProps) => {
    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, showAfter);

        return () => {
            clearTimeout(timer);
        };
    }, [showAfter]);

    if (!isVisible) {
        return null;
    }

    return (
        <div className={b(null, className)}>
            <Loader size={size} />
        </div>
    );
};
