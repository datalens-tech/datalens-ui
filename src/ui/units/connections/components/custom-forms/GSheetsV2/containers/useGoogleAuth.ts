import React from 'react';

import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';

import {showToast} from '../../../../../../store/actions/toaster';
import {googleLogin} from '../../../../store';

import {useGSheetDialogs} from './useGSheetDialogs';
import {getGoogleOAuth2Code} from './utils';

const i18n = I18n.keyset('connections.gsheet.view');

export const useGoogleAuth = () => {
    const dispatch = useDispatch();
    const {openLogoutDialog} = useGSheetDialogs();

    const clickGoogleLoginButton = React.useCallback(async () => {
        try {
            const code = await getGoogleOAuth2Code();

            if (code) {
                dispatch(googleLogin(code));
            }
        } catch (error) {
            dispatch(
                showToast({
                    error,
                    title: i18n('label_auth-failure'),
                }),
            );
        }
    }, [dispatch]);

    const clickGoogleLogoutButton = React.useCallback(() => {
        openLogoutDialog();
    }, [openLogoutDialog]);

    return {clickGoogleLoginButton, clickGoogleLogoutButton};
};
