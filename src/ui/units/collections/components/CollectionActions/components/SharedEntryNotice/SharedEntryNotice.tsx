import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import './SharedEntryNotice.scss';

const i18n = I18n.keyset('collections');
const b = block('dl-shared-entry-actions-notice');

export const SharedEntryNotice = () => {
    return (
        <div className={b()}>
            <div className={b('notice-container')}>
                <p className={b('notice-text')}>{i18n('shared-actions-menu-notice')}</p>
            </div>
        </div>
    );
};
