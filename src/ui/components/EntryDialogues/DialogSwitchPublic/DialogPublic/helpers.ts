import {i18n} from 'i18n';

export function getTextNoPermission() {
    return i18n('component.dialog-switch-public.view', 'label_no-permission-alert', {
        permission: i18n('component.permission-select.view', 'field_admin'),
    });
}
