import React from 'react';

import {HelpPopover} from '@gravity-ui/components';
import {Button, Checkbox, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {ConnectorType} from 'shared';
import {registry} from 'ui/registry';

import {ButtonLogout} from '../../components';
import {i18n8857} from '../constants';

import iconSync from '../../../../../../assets/icons/sync.svg';

const b = block('conn-form-yadocs');
const ICON_SIZE = 18;

type Props = {
    authorized: boolean;
    clickLoginButton: (oauthToken: string) => void;
    clickLogoutButton: () => void;
};

export const AdditionalTitleContent = (props: Props) => {
    const {authorized, clickLoginButton, clickLogoutButton} = props;
    const {OAuthTokenButton} = registry.common.components.getAll();

    return (
        <div className={b('title-add')}>
            <div className={b('title-add-content')}>
                {authorized ? (
                    <ButtonLogout onClick={clickLogoutButton} />
                ) : (
                    <OAuthTokenButton
                        application={ConnectorType.Yadocs}
                        text={i18n8857.button_auth}
                        onTokenChange={clickLoginButton}
                    />
                )}
            </div>
            <div className={b('title-add-content')}>
                <Checkbox>{i18n8857['label_auto-update']}</Checkbox>
                <HelpPopover
                    className={b('help-btn', {'with-margin-right': true})}
                    content={i18n8857['label_auto-update-help']}
                />
                <Button>
                    <Icon data={iconSync} size={ICON_SIZE} />
                    {i18n8857.button_update}
                </Button>
            </div>
        </div>
    );
};
