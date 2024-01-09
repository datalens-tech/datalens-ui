import React from 'react';

import block from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import {ConnectorType} from 'shared';

import {
    innerAuthorizedSelector,
    newConnectionSelector,
    oauthLogin,
    setYadocsActiveDialog,
    yadocsActiveDialogSelector,
} from '../../../../store';
import {FormTitle} from '../../../FormTitle/FormTitle';
import {AdditionalTitleContent} from '../components';
import {i18n8857} from '../constants';

import {useYadocsDialogs} from './useYadocsDialogs';

const b = block('conn-form-yadocs');

export const ActionBarContainer = () => {
    const dispatch = useDispatch();
    const activeDialog = useSelector(yadocsActiveDialogSelector);
    const authorized = useSelector(innerAuthorizedSelector);
    const newConnection = useSelector(newConnectionSelector);
    const {openLogoutDialog} = useYadocsDialogs();

    const clickLoginButton = React.useCallback(
        (oauthToken: string) => {
            dispatch(oauthLogin(oauthToken));
        },
        [dispatch],
    );

    const clickLogoutButton = React.useCallback(() => {
        dispatch(
            setYadocsActiveDialog({
                activeDialog: {
                    type: 'dialog-logout',
                },
            }),
        );
    }, [dispatch]);

    const additionalContent = React.useMemo(() => {
        return (
            <AdditionalTitleContent
                authorized={authorized}
                clickLoginButton={clickLoginButton}
                clickLogoutButton={clickLogoutButton}
            />
        );
    }, [authorized, clickLoginButton, clickLogoutButton]);

    React.useEffect(() => {
        if (activeDialog) {
            switch (activeDialog.type) {
                case 'dialog-logout': {
                    openLogoutDialog();
                }
            }
        }
    }, [activeDialog, openLogoutDialog]);

    return (
        <FormTitle
            className={b('title')}
            type={ConnectorType.Yadocs}
            title={i18n8857['label_form-tile']}
            additionalContent={additionalContent}
            showArrow={newConnection}
        />
    );
};
