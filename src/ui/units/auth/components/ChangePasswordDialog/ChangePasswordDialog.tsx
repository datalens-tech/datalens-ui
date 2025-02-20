import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {Alert, Dialog, Flex, PasswordInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import type {SdkError} from 'ui/libs/schematic-sdk';
import type {AppDispatch} from 'ui/store';
import {showToast} from 'ui/store/actions/toaster';

import {AuthErrorCode} from '../../constants/errors';
import {resetUpdateUserPasswordState, updateUserPassword} from '../../store/actions/userProfile';
import {selectUpdateUserPasswordIsLoading} from '../../store/selectors/userProfile';

import './ChangePasswordDialog.scss';

const b = block('change-user-password-dialog');

const i18n = I18n.keyset('auth.dialog-change-password');

interface ChangeUserPasswordDialogProps {
    userId: string;

    open: boolean;
    onClose: VoidFunction;
    onSuccess?: VoidFunction;

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
    onSuccess,
    isOwnProfile,
}: ChangeUserPasswordDialogProps) {
    const dispatch = useDispatch<AppDispatch>();
    const [oldPassword, setOldPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [repeatPassword, setRepeatPassword] = React.useState('');

    const infoMessage = isOwnProfile ? '' : i18n('label_admin-notification');

    const [errorMessage, setErrorMessage] = React.useState<null | string>(null);

    const [validationsStates, setValidationsStates] =
        React.useState<Record<string, undefined | 'invalid'>>(INITIAL_VALIDATION_STATE);

    const isLoading = useSelector(selectUpdateUserPasswordIsLoading);

    React.useLayoutEffect(() => {
        if (open) {
            setErrorMessage(null);
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
        setOldPassword('');
        setNewPassword('');
        setRepeatPassword('');
        onClose();
    };

    const handleSuccessUpdate = () => {
        dispatch(showToast({title: i18n('label_success-change'), type: 'success'}));
        onSuccess?.();
        handleClose();
    };

    const handleErrorUpdate = (error: SdkError) => {
        if (error.code === AuthErrorCode.IncorrectOldPassword) {
            setValidationsStates({
                ...validationsStates,
                oldPassword: 'invalid',
            });
            setErrorMessage(i18n('label_error-incorrect-old-password'));

            return;
        }

        dispatch(showToast({title: error.message, error}));
    };

    const handleApplyChangePassword = () => {
        setErrorMessage(null);
        setValidationsStates(INITIAL_VALIDATION_STATE);

        if (!newPassword || (isOwnProfile && (!repeatPassword || !oldPassword))) {
            setErrorMessage(i18n('label_error-required-fields'));
            setValidationsStates({
                newPassword: newPassword ? undefined : 'invalid',
                oldPassword: oldPassword || !isOwnProfile ? undefined : 'invalid',
                repeatPassword: repeatPassword || !isOwnProfile ? undefined : 'invalid',
            });
            return;
        }

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
                data: {
                    userId,
                    newPassword,
                    oldPassword: isOwnProfile ? oldPassword : undefined,
                },
                onSuccess: handleSuccessUpdate,
                onError: handleErrorUpdate,
            }),
        );
    };

    const handleFormChange = () => {
        if (errorMessage) {
            setErrorMessage(null);
            setValidationsStates(INITIAL_VALIDATION_STATE);
        }
    };

    const alertTheme = isOwnProfile || errorMessage ? 'danger' : 'info';
    const newPasswordLabel = isOwnProfile ? i18n('label_new-password') : i18n('label_password');
    const message = errorMessage || infoMessage;

    return (
        <Dialog size="m" open={open} onClose={handleClose} onEscapeKeyDown={handleClose}>
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
                    >
                        {isOwnProfile && (
                            <FormRow label={i18n('label_old-password')} className={b('row')}>
                                <PasswordInput
                                    value={oldPassword}
                                    onUpdate={handleOldPasswordChange}
                                    validationState={validationsStates.oldPassword}
                                    hideCopyButton={true}
                                    autoComplete="current-password"
                                />
                            </FormRow>
                        )}
                        <FormRow label={newPasswordLabel} className={b('row')}>
                            <PasswordInput
                                value={newPassword}
                                onUpdate={handleNewPasswordChange}
                                validationState={validationsStates.newPassword}
                                hideCopyButton={true}
                                autoComplete="new-password"
                            />
                        </FormRow>
                        {isOwnProfile && (
                            <FormRow label={i18n('label_repeat-password')} className={b('row')}>
                                <PasswordInput
                                    value={repeatPassword}
                                    onUpdate={handleRepeatPasswordChange}
                                    validationState={validationsStates.repeatPassword}
                                    hideCopyButton={true}
                                    autoComplete="new-password"
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
