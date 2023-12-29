import React from 'react';

import {ArrowRightFromSquare} from '@gravity-ui/icons';
import {Button, Icon, Label} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import './ButtonLogout.scss';

const b = block('conn-button-logout');
const i18n = I18n.keyset('connections.gsheet.view');
const ICON_SIZE = 16;

type Props = {
    onClick?: () => void;
};

export const ButtonLogout = ({onClick}: Props) => {
    return (
        <div className={b()}>
            <Label size="m">
                <div className={b('label-content')}>{i18n('label_auth-success')}</div>
            </Label>
            <Button className={b('action')} view="flat" pin="brick-round" onClick={onClick}>
                <Icon data={ArrowRightFromSquare} size={ICON_SIZE} />
            </Button>
        </div>
    );
};
