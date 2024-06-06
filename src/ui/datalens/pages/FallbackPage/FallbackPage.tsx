import React from 'react';
import block from 'bem-cn-lite';

import type {LoaderProps} from '@gravity-ui/uikit';
import {Loader} from '@gravity-ui/uikit';

import './FallbackPage.scss';

const b = block('fallback-page');

const FallbackPage = (p: {size?: LoaderProps['size']}) => (
    <div className={b()}>
        <Loader size={p.size ?? 'l'}></Loader>
    </div>
);

export default FallbackPage;
