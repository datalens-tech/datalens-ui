import React from 'react';

import block from 'bem-cn-lite';

import {getSharedEntryMockText} from '../../../helpers';

import './SharedEntryNotice.scss';

const b = block('dl-shared-entry-actions-notice');

export const SharedEntryNotice = () => {
    return (
        <div className={b()}>
            <div className={b('notice-container')}>
                <p className={b('notice-text')}>
                    {getSharedEntryMockText('collection-actions-menu-notice')}
                </p>
            </div>
        </div>
    );
};
