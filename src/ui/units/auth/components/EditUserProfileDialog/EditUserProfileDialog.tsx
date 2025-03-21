import React from 'react';

import {Alert, Dialog, Flex} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import type {SdkError} from 'ui/libs/schematic-sdk';
import {showToast} from 'ui/store/actions/toaster';

import {
    resetUserInfoForm,
    resetUserInfoFormValidation,
    updateFormValidation,
    updateFormValues,
} from '../../store/actions/userInfoForm';
import {updateUserProfile} from '../../store/actions/userProfile';
import {selectUserInfoFormValues} from '../../store/selectors/userInfoForm';
import {selectEditUserProfileIsLoading} from '../../store/selectors/userProfile';
import {baseFieldsValidSchema} from '../../utils/validation';
import {Email} from '../formControls/Email';
import {FirstName} from '../formControls/FirstName';
import {LastName} from '../formControls/LastName';

const i18n = I18n.keyset('auth.dialog-edit-profile');

interface EditUserProfileDialogProps {
    userId: string;

    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;

    open: boolean;
    onClose: VoidFunction;
    onSuccess?: VoidFunction;
}

export function EditUserProfileDialog({
    userId,
    email,
    firstName,
    lastName,
    open,
    onClose,
    onSuccess,
}: EditUserProfileDialogProps) {
    const dispatch = useDispatch();

    const [errorMessage, setErrorMessage] = React.useState(null);

    const hasChanges = React.useRef(false);

    const isLoading = useSelector(selectEditUserProfileIsLoading);
    const formData = useSelector(selectUserInfoFormValues);

    React.useEffect(() => {
        if (open) {
            hasChanges.current = false;
            dispatch(resetUserInfoForm());
            dispatch(
                updateFormValues({
                    email: email || '',
                    firstName: firstName || '',
                    lastName: lastName || '',
                }),
            );

            setErrorMessage(null);
        }
    }, [dispatch, email, firstName, lastName, open]);

    React.useEffect(() => {
        return () => {
            dispatch(resetUserInfoForm());
        };
    }, [dispatch]);

    const handleSuccess = () => {
        dispatch(showToast({title: i18n('label_success-edit'), type: 'success'}));
        onClose();
        onSuccess?.();
    };

    const handleError = (error: SdkError) => {
        dispatch(showToast({title: error.message, error}));
    };

    const handleApply = () => {
        if (!hasChanges.current) {
            onClose();
            return;
        }

        const profileData: Record<string, string | null> = {
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
        };

        try {
            baseFieldsValidSchema.validateSync(profileData);
        } catch (error) {
            setErrorMessage(error.message);
            dispatch(updateFormValidation({[error.path]: 'invalid'}));
            return;
        }

        // convert empty string to null to reset values via request
        Object.keys(profileData).forEach((key) => {
            if (profileData[key] === '') {
                profileData[key] = null;
            }
        });

        dispatch(
            updateUserProfile({
                data: {userId, ...profileData},
                onSuccess: handleSuccess,
                onError: handleError,
            }),
        );
    };

    const handleFormChange = () => {
        hasChanges.current = true;
        if (errorMessage) {
            setErrorMessage(null);
            dispatch(resetUserInfoFormValidation());
        }
    };

    return (
        <Dialog
            size="m"
            open={open}
            onEscapeKeyDown={onClose}
            onClose={onClose}
            onEnterKeyDown={handleApply}
        >
            <Dialog.Header caption={i18n('title_edit-profile')} />
            <Dialog.Body>
                <Flex direction="column" gap="4" as="form" onChange={handleFormChange}>
                    {errorMessage && <Alert theme="danger" message={errorMessage} />}
                    <Flex direction="column" gap="3">
                        <FirstName />
                        <LastName />
                        <Email />
                    </Flex>
                </Flex>
            </Dialog.Body>
            <Dialog.Footer
                textButtonApply={i18n('button_save')}
                textButtonCancel={i18n('button_cancel')}
                onClickButtonCancel={onClose}
                onClickButtonApply={handleApply}
                propsButtonApply={{loading: isLoading}}
            />
        </Dialog>
    );
}
