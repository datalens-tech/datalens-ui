import {toaster} from '@gravity-ui/uikit/toaster-singleton';
import {I18n} from 'i18n';

const i18n = I18n.keyset('common.read-only');

export const showReadOnlyToast = () => {
    toaster.add({
        theme: 'danger',
        name: 'ReadOnlyError',
        title: i18n('toast_editing-warning'),
    });
};
