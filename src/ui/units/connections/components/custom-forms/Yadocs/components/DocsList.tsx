import React from 'react';

import {Plus} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {i18n8857} from '../constants';

const b = block('conn-form-yadocs');

export const DocsList = () => {
    return (
        <div className={b('list')}>
            <div className={b('add-section')}>
                <Button view="outlined">
                    <Icon data={Plus} size={14} />
                    {i18n8857['button_add-document']}
                </Button>
            </div>
        </div>
    );
};
