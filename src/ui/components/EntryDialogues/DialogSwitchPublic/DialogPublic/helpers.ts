import {i18n} from 'i18n';

import {PERMISSION} from '../../../../constants/common';
import {getTextByPermission} from '../../../../utils';

export function getTextNoPermission() {
    return i18n('component.dialog-switch-public.view', 'label_no-permission-alert', {
        permission: getTextByPermission(PERMISSION.ADMIN),
    });
}
