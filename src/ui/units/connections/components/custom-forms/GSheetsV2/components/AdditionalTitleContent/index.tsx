import React from 'react';

import {Button, Checkbox, HelpMark, Icon, Popover} from '@gravity-ui/uikit';
import type {PopoverInstanceProps} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import {GAuthButton} from './GAuthButton';

import iconSync from '../../../../../../../assets/icons/sync.svg';

const b = block('conn-form-gsheets');
const i18n = I18n.keyset('connections.gsheet.view');
const ICON_SIZE = 18;

type AdditionalTitleContentProps = {
    authorized?: boolean;
    refreshEnabled?: boolean;
    disableControls?: boolean;
    dlGsheetAuthHintShown?: boolean;
    clickAutoUpdateCheckbox: (value: boolean) => void;
    clickGoogleLoginButton: () => void;
    clickGoogleLogoutButton: () => void;
    handleGAuthPopoverClose: () => void;
    updateData: () => void;
};

export const AdditionalTitleContent = (props: AdditionalTitleContentProps) => {
    const {
        authorized,
        refreshEnabled,
        disableControls,
        dlGsheetAuthHintShown,
        clickAutoUpdateCheckbox,
        clickGoogleLoginButton,
        clickGoogleLogoutButton,
        handleGAuthPopoverClose,
        updateData,
    } = props;
    const loginButtonRef = React.useRef<HTMLButtonElement>(null);
    const popoverRef = React.useRef<PopoverInstanceProps>(null);
    const {current: initialGAuthPopoverOpen} = React.useRef(!dlGsheetAuthHintShown);

    React.useEffect(() => {
        if (authorized && initialGAuthPopoverOpen) {
            popoverRef.current?.closeTooltip();
            handleGAuthPopoverClose();
        }
    }, [authorized, initialGAuthPopoverOpen, handleGAuthPopoverClose]);

    return (
        <div className={b('title-add')}>
            <div className={b('title-add-content')}>
                <GAuthButton
                    ref={loginButtonRef}
                    authorized={authorized}
                    onClick={authorized ? clickGoogleLogoutButton : clickGoogleLoginButton}
                />
                <Popover
                    ref={popoverRef}
                    anchorRef={loginButtonRef}
                    tooltipClassName={b('gauth-popover')}
                    content={<div>{i18n('label_google-auth-help')}</div>}
                    placement="bottom"
                    initialOpen={initialGAuthPopoverOpen}
                    hasClose={true}
                    onCloseClick={handleGAuthPopoverClose}
                />
            </div>
            <div className={b('title-add-content')}>
                <Checkbox
                    checked={refreshEnabled}
                    disabled={disableControls}
                    onUpdate={clickAutoUpdateCheckbox}
                >
                    {i18n('label_auto-update')}
                </Checkbox>
                <HelpMark
                    className={b('help-btn', {'with-margin-right': true})}
                    popoverProps={{content: i18n('label_auto-update-help')}}
                />
                <Button disabled={disableControls} onClick={updateData}>
                    <Icon data={iconSync} size={ICON_SIZE} />
                    {i18n('button_update')}
                </Button>
            </div>
        </div>
    );
};
