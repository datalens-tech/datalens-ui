import React from 'react';

import {ConfirmDialog} from '@gravity-ui/components';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import type {AppDispatch} from 'ui/store';

import {deleteUserProfile} from '../../store/actions/userProfile';
import {selectDeleteUserProfileIsLoading} from '../../store/selectors/userProfile';

const i18n = I18n.keyset('auth.dialog-delete-user');

interface DeleteUserDialogProps {
    userId: string;

    open: boolean;
    onClose: VoidFunction;
    onSuccess?: VoidFunction;
}

export function DeleteUserDialog({userId, open, onClose, onSuccess}: DeleteUserDialogProps) {
    const dispatch = useDispatch<AppDispatch>();

    const isDeleteLoading = useSelector(selectDeleteUserProfileIsLoading);

    const handleDeleteUser = () => {
        const handleSuccess = () => {
            onClose();
            onSuccess?.();
        };
        dispatch(deleteUserProfile({userId}, handleSuccess));
    };

    return (
        <ConfirmDialog
            open={open}
            onClose={onClose}
            size="s"
            title={i18n('title_delete-user')}
            message={i18n('label_delete-user-confirmation')}
            textButtonCancel={i18n('action_user-profile-deletion-cancel')}
            textButtonApply={i18n('action_user-profile-deletion-confirm')}
            onClickButtonCancel={onClose}
            onClickButtonApply={handleDeleteUser}
            propsButtonCancel={{
                disabled: isDeleteLoading,
            }}
            propsButtonApply={{
                loading: isDeleteLoading,
                view: 'outlined-danger',
            }}
        />
    );
}
