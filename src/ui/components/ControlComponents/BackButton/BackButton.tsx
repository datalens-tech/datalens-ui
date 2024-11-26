import React from 'react';

import {ArrowLeft} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import './BackButton.scss';

const b = block('back-dialog-button');
const i18n = I18n.keyset('dash.dialogs-common.edit');

export const BackButton = ({onClose}: {onClose: () => void}) => {
    return (
        <Button view="flat" size="l" title={i18n('button_back')} className={b()} onClick={onClose}>
            <Icon data={ArrowLeft} size={18} />
        </Button>
    );
};
