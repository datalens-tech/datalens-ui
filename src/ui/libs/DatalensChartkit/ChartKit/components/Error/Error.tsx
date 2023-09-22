import React from 'react';

import {CircleXmark} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {i18n} from '../../modules/i18n/i18n';

import './Error.scss';

const b = block('chartkit-error');

export const Error: React.FC<any> = ({error}) => {
    const message = error.message || i18n('chartkit', 'error');
    return (
        <div className={b()}>
            <div className={b('title')}>
                <Icon data={CircleXmark} className={b('icon')} />
                {message}
            </div>
        </div>
    );
};
