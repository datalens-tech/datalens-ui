import React from 'react';

import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {isMobileView} from 'ui/utils/mobile';

import iconAlert from 'assets/icons/alert.svg';

import './Error.scss';

const b = block('dashkit-control-error');
const i18n = I18n.keyset('component.dashkit.view');

export function Error({onClick}: {onClick: () => void}) {
    return (
        <div className={b({mobile: isMobileView})} onClick={onClick}>
            <span className={b('label')}>{i18n('label_error')}</span>
            <Icon data={iconAlert} className={b('icon')} />
        </div>
    );
}
