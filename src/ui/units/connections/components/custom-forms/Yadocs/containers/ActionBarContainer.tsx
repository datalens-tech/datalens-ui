import React from 'react';

import block from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import {ConnectorType} from 'shared';

import {FieldKey} from '../../../../constants';
import {
    formSelector,
    innerAuthorizedSelector,
    newConnectionSelector,
    oauthLogin,
    setForm,
    setYadocsActiveDialog,
    updateYadocConnectionData,
    yadocsActiveDialogSelector,
    yadocsUpdatingSelector,
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
    const form = useSelector(formSelector);
    const newConnection = useSelector(newConnectionSelector);
    const {openLogoutDialog} = useYadocsDialogs();
    // We set the default value so as not to receive a react warning:
    // "A component is changing an uncontrolled input to be controlled"
    const refreshEnabled = (form[FieldKey.RefreshEnabled] as boolean) ?? false;
    const yadocsUpdating = useSelector(yadocsUpdatingSelector);

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

    const updateData = React.useCallback(() => {
        dispatch(updateYadocConnectionData());
    }, [dispatch]);

    const clickAutoUpdateCheckbox = React.useCallback(
        (value: boolean) => {
            if (value && !newConnection) {
                updateData();
            }

            dispatch(setForm({updates: {[FieldKey.RefreshEnabled]: value}}));
        },
        [newConnection, dispatch, updateData],
    );

    const additionalContent = React.useMemo(() => {
        return (
            <AdditionalTitleContent
                authorized={authorized}
                disableControls={yadocsUpdating}
                refreshEnabled={refreshEnabled}
                updateData={updateData}
                clickAutoUpdateCheckbox={clickAutoUpdateCheckbox}
                clickLoginButton={clickLoginButton}
                clickLogoutButton={clickLogoutButton}
            />
        );
    }, [
        authorized,
        yadocsUpdating,
        refreshEnabled,
        clickAutoUpdateCheckbox,
        clickLoginButton,
        clickLogoutButton,
        updateData,
    ]);

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
