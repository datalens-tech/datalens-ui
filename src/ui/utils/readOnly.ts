import {Toaster} from '@gravity-ui/uikit';
import {I18n} from 'i18n';

const toaster = new Toaster();

const i18n = I18n.keyset('common.read-only');

export const showReadOnlyToast = () => {
    toaster.add({
        type: 'error',
        name: 'ReadOnlyError',
        title: i18n('toast_editing-warning'),
    });
};
