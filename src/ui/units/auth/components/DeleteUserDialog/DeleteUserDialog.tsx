import React from 'react';

import {ConfirmDialog} from '@gravity-ui/components';
import {useDispatch, useSelector} from 'react-redux';
import type {AppDispatch} from 'ui/store';

import {deleteUserProfile} from '../../store/actions/userProfile';
import {selectDeleteUserProfileIsLoading} from '../../store/selectors/userProfile';
// import {I18n, i18n} from 'i18n';

// TODO: add translations
// const i18n = I18n.keyset('auth.dialog-delete-user');

const i18n = (key: string) => {
    switch (key) {
        case 'title_delete-user':
            return 'Delete user';
        case 'label_delete-user-confirmation':
            return 'The user will be deleted and will no longer be able to use DataLens. Are you sure?';
        case 'label_failed-to-delete-user':
            return 'Failed to delete user';
        case 'action_user-profile-deletion-cancel':
            return 'Cancel';
        case 'action_user-profile-deletion-confirm':
            return 'Delete user';
        default:
            return key;
    }
};

interface DeleteUserDialogProps {
    userId: string;

    open: boolean;
    onClose: VoidFunction;
}

export function DeleteUserDialog({userId, open, onClose}: DeleteUserDialogProps) {
    const dispatch = useDispatch<AppDispatch>();

    const isDeleteLoading = useSelector(selectDeleteUserProfileIsLoading);

    const handleDeleteUser = React.useCallback(() => {
        dispatch(deleteUserProfile({userId}));
    }, [dispatch, userId]);

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
