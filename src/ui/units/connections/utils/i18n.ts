import {I18n, i18n} from 'i18n';
import type {ActualConnectorType} from 'shared';

const i18nForm = I18n.keyset('connections.form');

export const getConnectorTitle = (type: string) => {
    return i18n(
        'connections.connectors-list.view',
        `label_connector-${type as ActualConnectorType}`,
    );
};

export const getSubmitButtonText = (newConnection: boolean) => {
    return newConnection ? i18nForm('button_create-connection') : i18nForm('button_save-conn-v2');
};
