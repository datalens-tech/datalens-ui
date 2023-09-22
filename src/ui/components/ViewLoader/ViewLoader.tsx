import React from 'react';

import {Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './ViewLoader.scss';

export interface ViewLoaderProps {
    size?: 's' | 'm' | 'l';
    text?: string;
    className?: string;
}

const b = block('dl-view-loader');

export const ViewLoader: React.FC<ViewLoaderProps> = ({
    className,
    size = 'm',
    text,
}: ViewLoaderProps) => {
    return (
        <div className={b(null, className)}>
            <Loader size={size} />
            {text ? <div className={b('text')}>{text}</div> : null}
        </div>
    );
};

export default ViewLoader;
