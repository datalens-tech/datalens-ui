import React, {useRef} from 'react';

import {FormRow} from '@gravity-ui/components';
import {Alert, Dialog, Flex, PasswordInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import type {AppDispatch} from 'ui/store';
import {showToast} from 'ui/store/actions/toaster';

import {AuthErrorCode} from '../../constants/errors';
import {resetUpdateUserPasswordState, updateUserPassword} from '../../store/actions/userProfile';
import {selectUpdateUserPasswordIsLoading} from '../../store/selectors/userProfile';

// import {I18n, i18n} from 'i18n';
import './ChangePasswordDialog.scss';

const b = block('change-user-password-dialog');

// TODO: add translations
// const i18n = I18n.keyset('auth.dialog-change-password.view');

const i18n = (key: string) => {
    switch (key) {
        case 'title_change-password':
            return 'Change password';
        case 'label_old-password':
            return 'Old password';
        case 'label_new-password':
            return 'New password';
        case 'label_repeat-password':
            return 'Repeat';
        case 'label_password':
            return 'Password';
        case 'label_error-passwords-not-match':
            return "Passwords don't match";
        case 'label_error-incorrect-old-password':
            return 'Incorrect old password';
        case 'label_admin-notification':
            return 'Since this is a temporary password ask the employee to change it';
        case 'label_success-change':
            return 'Password has been successfully changed';
        case 'button_save':
            return 'Save';
        case 'button_cancel':
            return 'Cancel';
        default:
            return key;
    }
};

interface ChangeUserPasswordDialogProps {
    userId: string;

    open: boolean;
    onClose: VoidFunction;

    isOwnProfile: boolean;
}

const INITIAL_VALIDATION_STATE = {
    oldPassword: undefined,
    newPassword: undefined,
    repeatPassword: undefined,
};

export function ChangePasswordDialog({
    userId,
    open,
    onClose,
    isOwnProfile,
}: ChangeUserPasswordDialogProps) {
    const dispatch = useDispatch<AppDispatch>();
    const formRef = useRef<HTMLFormElement>(null);
    const [oldPassword, setOldPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [repeatPassword, setRepeatPassword] = React.useState('');

    const infoMessage = isOwnProfile ? '' : i18n('label_admin-notification');

    const [errorMessage, setErrorMessage] = React.useState('');

    const [validationsStates, setValidationsStates] =
        React.useState<Record<string, undefined | 'invalid'>>(INITIAL_VALIDATION_STATE);

    const isLoading = useSelector(selectUpdateUserPasswordIsLoading);

    React.useLayoutEffect(() => {
        if (open) {
            setErrorMessage('');
            setValidationsStates(INITIAL_VALIDATION_STATE);
            dispatch(resetUpdateUserPasswordState());
        }
    }, [dispatch, open]);

    const handleOldPasswordChange = (value: string) => {
        setOldPassword(value);
    };

    const handleNewPasswordChange = (value: string) => {
        setNewPassword(value);
    };

    const handleRepeatPasswordChange = (value: string) => {
        setRepeatPassword(value);
    };

    const handleClose = () => {
        formRef.current?.reset();
        onClose();
    };

    const handleApplyChangePassword = () => {
        setErrorMessage('');
        setValidationsStates(INITIAL_VALIDATION_STATE);
        if (isOwnProfile && newPassword !== repeatPassword) {
            setErrorMessage(i18n('label_error-passwords-not-match'));
            setValidationsStates({
                ...validationsStates,
                newPassword: 'invalid',
                repeatPassword: 'invalid',
            });
            return;
        }

        dispatch(
            updateUserPassword({
                userId,
                newPassword,
                oldPassword: isOwnProfile ? oldPassword : undefined,
            }),
        )
            .then(() => {
                dispatch(showToast({title: i18n('label_success-change'), type: 'success'}));
                handleClose();
            })
            .catch((error) => {
                if (error.code === AuthErrorCode.IncorrectOldPassword) {
                    setValidationsStates({
                        ...validationsStates,
                        oldPassword: 'invalid',
                    });
                    setErrorMessage(i18n('label_error-incorrect-old-password'));
                }
            });
    };

    const handleFormChange = () => {
        if (errorMessage) {
            setErrorMessage('');
            setValidationsStates(INITIAL_VALIDATION_STATE);
        }
    };

    const alertTheme = isOwnProfile ? 'danger' : 'info';
    const newPasswordLabel = isOwnProfile ? i18n('label_new-password') : i18n('label_password');
    const message = errorMessage || infoMessage;

    return (
        <Dialog size="m" open={open} onClose={handleClose} onEnterKeyDown={handleClose}>
            <Dialog.Header caption={i18n('title_change-password')} />
            <Dialog.Body>
                <Flex gap={4} direction="column">
                    {message && <Alert theme={alertTheme} message={message} />}
                    <Flex
                        gap={3}
                        className={b('form')}
                        as="form"
                        direction="column"
                        onChange={handleFormChange}
                        ref={formRef}
                    >
                        {isOwnProfile && (
                            <FormRow label={i18n('label_old-password')} className={b('row')}>
                                <PasswordInput
                                    value={oldPassword}
                                    onUpdate={handleOldPasswordChange}
                                    validationState={validationsStates.oldPassword}
                                    hideCopyButton={true}
                                />
                            </FormRow>
                        )}
                        <FormRow label={newPasswordLabel} className={b('row')}>
                            <PasswordInput
                                value={newPassword}
                                onUpdate={handleNewPasswordChange}
                                validationState={validationsStates.newPassword}
                                hideCopyButton={true}
                            />
                        </FormRow>
                        {isOwnProfile && (
                            <FormRow label={i18n('label_repeat-password')} className={b('row')}>
                                <PasswordInput
                                    value={repeatPassword}
                                    onUpdate={handleRepeatPasswordChange}
                                    validationState={validationsStates.repeatPassword}
                                    hideCopyButton={true}
                                />
                            </FormRow>
                        )}
                    </Flex>
                </Flex>
            </Dialog.Body>
            <Dialog.Footer
                onClickButtonApply={handleApplyChangePassword}
                onClickButtonCancel={handleClose}
                propsButtonApply={{loading: isLoading}}
                textButtonApply={i18n('button_save')}
                textButtonCancel={i18n('button_cancel')}
            />
        </Dialog>
    );
}
