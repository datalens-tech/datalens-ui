import {I18n} from 'i18n';

const i18n = I18n.keyset('connections.form');

export const getSubmitButtonText = (newConnection: boolean) => {
    return newConnection ? i18n('button_create-connection') : i18n('button_save-conn-v2');
};
