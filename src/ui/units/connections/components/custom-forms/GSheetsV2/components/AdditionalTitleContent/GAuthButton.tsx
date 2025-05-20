import React from 'react';

import {HelpMark, Icon, useThemeType} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {Lang} from 'shared';
import {DL} from 'ui';

import {ButtonLogout} from '../../../components';

import btnDarkEnData from '../../../../../assets/icons/gauth-btn-dark-en.svg';
import btnDarkRuData from '../../../../../assets/icons/gauth-btn-dark-ru.svg';
import btnLightEnData from '../../../../../assets/icons/gauth-btn-light-en.svg';
import btnLightRuData from '../../../../../assets/icons/gauth-btn-light-ru.svg';

const b = block('conn-form-gsheets');
const i18n = I18n.keyset('connections.gsheet.view');

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
        return <ButtonLogout onClick={onClick} />;
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
            <HelpMark
                className={b('help-btn')}
                popoverProps={{content: i18n('label_google-auth-help')}}
            />
        </React.Fragment>
    );
});

GAuthButton.displayName = 'GAuthButton';
