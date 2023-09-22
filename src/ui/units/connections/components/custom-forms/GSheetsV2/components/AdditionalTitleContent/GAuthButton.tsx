import React from 'react';

import {HelpPopover} from '@gravity-ui/components';
import {ArrowRightFromSquare} from '@gravity-ui/icons';
import {Button, Icon, Label, useThemeType} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {Lang} from 'shared';
import {DL} from 'ui';

import btnDarkEnData from '../../../../../assets/icons/gauth-btn-dark-en.svg';
import btnDarkRuData from '../../../../../assets/icons/gauth-btn-dark-ru.svg';
import btnLightEnData from '../../../../../assets/icons/gauth-btn-light-en.svg';
import btnLightRuData from '../../../../../assets/icons/gauth-btn-light-ru.svg';

const b = block('conn-form-gsheets');
const i18n = I18n.keyset('connections.gsheet.view');
const ICON_SIZE = 16;

type ThemeType = ReturnType<typeof useThemeType>;

type GAuthButtonProps = {
    authorized?: boolean;
    onClick: () => void;
};

const getGAuthIconData = ({themeType, lang}: {themeType: ThemeType; lang: Lang}) => {
    if (themeType === 'dark') {
        return lang === 'ru' ? btnDarkRuData : btnDarkEnData;
    }

    return lang === 'ru' ? btnLightRuData : btnLightEnData;
};

export const GAuthButton = React.forwardRef<HTMLButtonElement, GAuthButtonProps>((props, ref) => {
    const {authorized, onClick} = props;
    const themeType = useThemeType();

    if (authorized) {
        return (
            <React.Fragment>
                <Label className={b('title-add-logout-label')} size="m">
                    {i18n('label_auth-success')}
                    <Button
                        className={b('title-add-logout-btn')}
                        view="flat"
                        pin="brick-round"
                        onClick={onClick}
                    >
                        <Icon data={ArrowRightFromSquare} size={ICON_SIZE} />
                    </Button>
                </Label>
            </React.Fragment>
        );
    }

    return (
        <React.Fragment>
            {/*
                Google Sign in button should displayed according to this style guide:
                https://developers.google.com/identity/branding-guidelines?hl=en#g+signin-social-scopes
            */}
            <button ref={ref} className={b('gauth-btn')} onClick={onClick}>
                <Icon data={getGAuthIconData({themeType, lang: DL.USER_LANG})} />
            </button>
            <HelpPopover className={b('help-btn')} content={i18n('label_google-auth-help')} />
        </React.Fragment>
    );
});

GAuthButton.displayName = 'GAuthButton';
