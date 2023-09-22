import React from 'react';

import {Loader as CommonLoader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './Loader.scss';

interface LoaderProps {
    compact?: boolean;
    veil?: boolean;
}

const b = block('chartkit-loader');

export const Loader: React.FC<LoaderProps> = ({compact, veil}) => {
    return (
        <div className={b({veil})}>
            <div className={b('loader', {compact})}>
                <CommonLoader size="m" />
            </div>
        </div>
    );
};
