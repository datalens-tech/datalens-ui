import React from 'react';

import block from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import {ConnectorType} from 'shared';

import {updateUserSettings} from '../../../../../../store/actions/user';
import {selectdGsheetAuthHintShown} from '../../../../../../store/selectors/user';
import {FieldKey} from '../../../../constants';
import {
    formSelector,
    gsheetUpdatingSelector,
    innerAuthorizedSelector,
    newConnectionSelector,
    setForm,
    updateConnectionData,
} from '../../../../store';
import {getConnectorTitle} from '../../../../utils';
import {FormTitle} from '../../../FormTitle/FormTitle';
import {AdditionalTitleContent} from '../components';

import {useGoogleAuth} from './useGoogleAuth';

const b = block('conn-form-gsheets');

export const ActionBarContainer = () => {
    const dispatch = useDispatch();
    const {clickGoogleLoginButton, clickGoogleLogoutButton} = useGoogleAuth();
    const newConnection = useSelector(newConnectionSelector);
    const form = useSelector(formSelector);
    const gsheetUpdating = useSelector(gsheetUpdatingSelector);
    const authorized = useSelector(innerAuthorizedSelector);
    const dlGsheetAuthHintShown = useSelector(selectdGsheetAuthHintShown);
    // We set the default value so as not to receive a react warning:
    // "A component is changing an uncontrolled input to be controlled"
    const refreshEnabled = (form[FieldKey.RefreshEnabled] as boolean) ?? false;

    const updateData = React.useCallback(() => {
        dispatch(updateConnectionData());
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

    const handleGAuthPopoverClose = React.useCallback(() => {
        dispatch(updateUserSettings({newSettings: {dlGsheetAuthHintShown: true}}));
    }, [dispatch]);

    const additionalContent = React.useMemo(() => {
        return (
            <AdditionalTitleContent
                authorized={authorized}
                refreshEnabled={refreshEnabled}
                disableControls={gsheetUpdating}
                dlGsheetAuthHintShown={dlGsheetAuthHintShown}
                clickAutoUpdateCheckbox={clickAutoUpdateCheckbox}
                clickGoogleLoginButton={clickGoogleLoginButton}
                clickGoogleLogoutButton={clickGoogleLogoutButton}
                handleGAuthPopoverClose={handleGAuthPopoverClose}
                updateData={updateData}
            />
        );
    }, [
        authorized,
        refreshEnabled,
        gsheetUpdating,
        dlGsheetAuthHintShown,
        clickAutoUpdateCheckbox,
        clickGoogleLoginButton,
        clickGoogleLogoutButton,
        handleGAuthPopoverClose,
        updateData,
    ]);

    return (
        <FormTitle
            className={b('title')}
            type={ConnectorType.GsheetsV2}
            title={getConnectorTitle(ConnectorType.GsheetsV2)}
            additionalContent={additionalContent}
            showArrow={newConnection}
        />
    );
};
