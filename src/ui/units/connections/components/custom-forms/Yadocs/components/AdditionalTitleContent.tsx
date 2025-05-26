import React from 'react';

import {Button, Checkbox, HelpMark, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {ConnectorType} from 'shared';
import {registry} from 'ui/registry';

import {ButtonLogout} from '../../components';

import iconSync from '../../../../../../assets/icons/sync.svg';

const b = block('conn-form-yadocs');
const i18n = I18n.keyset('connections.yadocs.view');
const ICON_SIZE = 18;

type Props = {
    authorized: boolean;
    disableControls: boolean;
    refreshEnabled: boolean;
    clickAutoUpdateCheckbox: (value: boolean) => void;
    clickLoginButton: (oauthToken: string) => void;
    clickLogoutButton: () => void;
    updateData: () => void;
};

export const AdditionalTitleContent = (props: Props) => {
    const {
        authorized,
        disableControls,
        refreshEnabled,
        clickAutoUpdateCheckbox,
        clickLoginButton,
        clickLogoutButton,
        updateData,
    } = props;
    const {OAuthTokenButton} = registry.common.components.getAll();

    return (
        <div className={b('title-add')}>
            <div className={b('title-add-content')}>
                {authorized ? (
                    <ButtonLogout onClick={clickLogoutButton}>{i18n('label_logout')}</ButtonLogout>
                ) : (
                    <OAuthTokenButton
                        application={ConnectorType.Yadocs}
                        text={i18n('button_auth')}
                        onTokenChange={clickLoginButton}
                    />
                )}
            </div>
            <div className={b('title-add-content')}>
                <Checkbox
                    checked={refreshEnabled}
                    disabled={disableControls}
                    onUpdate={clickAutoUpdateCheckbox}
                >
                    {i18n('label_auto-update')}
                </Checkbox>
                <HelpMark className={b('help-btn', {'with-margin-right': true})}>
                    {i18n('label_auto-update-help')}
                </HelpMark>
                <Button disabled={disableControls} onClick={updateData}>
                    <Icon data={iconSync} size={ICON_SIZE} />
                    {i18n('button_update')}
                </Button>
            </div>
        </div>
    );
};
