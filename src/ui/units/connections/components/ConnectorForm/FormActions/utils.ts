import {I18n} from 'i18n';
import type {ValueOf} from 'shared';
import {CONNECTOR_VISIBILITY_MODE} from 'shared';

const i18n = I18n.keyset('connections.form');

export const getSubmitButtonText = (newConnection: boolean) => {
    return newConnection ? i18n('button_create-connection') : i18n('button_save-conn-v2');
};

export const getIsShowCreateConnectionButton = (
    visibilityMode: ValueOf<typeof CONNECTOR_VISIBILITY_MODE>,
) => {
    return visibilityMode !== CONNECTOR_VISIBILITY_MODE.UNCREATABLE;
};
