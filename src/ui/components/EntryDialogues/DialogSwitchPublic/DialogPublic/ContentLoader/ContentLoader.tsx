import React from 'react';

import {Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './ContentLoader.scss';

const b = block('dl-dialog-public-loader');

function ContentLoader({className}: {className?: string}) {
    return (
        <div className={b(null, className)}>
            <Loader size="m" />
        </div>
    );
}

export default ContentLoader;
