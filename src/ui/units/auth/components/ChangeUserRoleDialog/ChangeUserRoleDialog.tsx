import React from 'react';

import {Dialog, Flex, Select, Text, spacing} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import type {UserRole} from 'shared/components/auth/constants/role';
import type {AppDispatch} from 'ui/store';

import {updateUserRoles} from '../../store/actions/userProfile';
import {selectUpdateUserRoleIsLoading} from '../../store/selectors/userProfile';
import {getUsersRoles} from '../../utils/getUsersRoles';
import {getRoleByKey} from '../../utils/userProfile';

const i18n = I18n.keyset('auth.dialog-change-user-role');

const EXISITING_ROLES = getUsersRoles();

const ROLES_OPTIONS = EXISITING_ROLES.map((key) => ({
    value: key,
    content: getRoleByKey(key),
}));

const ROLES_OPTIONS_WITH_META = EXISITING_ROLES.map((key, i, rolesList) => {
    const roleName = getRoleByKey(key);
    const meta =
        i === 0 ? (
            i18n('label_base-role')
        ) : (
            <React.Fragment>
                {i18n('label_includes-permissions-from')}
                <Text variant="code-inline-1" className={spacing({ml: 1})}>
                    {getRoleByKey(rolesList[i - 1])}
                </Text>
            </React.Fragment>
        );
    return {
        value: key,
        content: (
            <Flex direction="column" alignItems="baseline">
                <span>{roleName}</span>
                <Text color="secondary">{meta}</Text>
            </Flex>
        ),
        text: roleName,
        data: {
            meta,
        },
    };
});

function getMaxRoleOfSelected(roles?: `${UserRole}`[]) {
    return roles?.reduce<`${UserRole}` | undefined>((maxRole, iRole) => {
        if (!maxRole) {
            return iRole;
        }

        const maxRoleIndex = EXISITING_ROLES.indexOf(maxRole);
        const iRoleIndex = EXISITING_ROLES.indexOf(iRole);

        return iRoleIndex > maxRoleIndex ? iRole : maxRole;
    }, undefined);
}

interface ChangeUserRoleDialogProps {
    userId: string;
    userRoles?: `${UserRole}`[];

    open: boolean;
    onClose: VoidFunction;
    onSuccess?: VoidFunction;
}

export function ChangeUserRoleDialog({
    userId,
    userRoles,
    open,
    onClose,
    onSuccess,
}: ChangeUserRoleDialogProps) {
    const dispatch = useDispatch<AppDispatch>();

    const isUpdateUserRoleLoading = useSelector(selectUpdateUserRoleIsLoading);

    const initialRole = getMaxRoleOfSelected(userRoles);
    const [roles, setRoles] = React.useState(initialRole ? [initialRole] : []);

    React.useEffect(() => {
        if (open) {
            setRoles(initialRole ? [initialRole] : []);
        }
    }, [open, initialRole]);

    const handleUpdateUserRoles = () => {
        const handleSuccess = () => {
            onClose();
            onSuccess?.();
        };
        dispatch(updateUserRoles({userId, oldRoles: userRoles, newRole: roles[0]}, handleSuccess));
    };

    const handleUserRolesChange = React.useCallback((value: string[]) => {
        setRoles(value as UserRole[]);
    }, []);

    const withSeveralInitialRoles = (userRoles?.length ?? 0) > 1;

    return (
        <Dialog open={open} onClose={onClose} size="s">
            <Dialog.Header caption={i18n('title_update-role')} />
            <Dialog.Body>
                <Select
                    placeholder={i18n('label_select-role')}
                    options={withSeveralInitialRoles ? ROLES_OPTIONS_WITH_META : ROLES_OPTIONS}
                    value={roles}
                    width="max"
                    hasClear
                    onUpdate={handleUserRolesChange}
                    getOptionHeight={withSeveralInitialRoles ? () => 48 : undefined}
                    renderOption={
                        withSeveralInitialRoles
                            ? ({text, data}) => (
                                  <Flex direction="column" alignItems="baseline">
                                      <span>{text}</span>
                                      {data?.meta && <Text color="secondary">{data.meta}</Text>}
                                  </Flex>
                              )
                            : undefined
                    }
                />
            </Dialog.Body>
            <Dialog.Footer
                textButtonCancel={i18n('action_user-roles-change-cancel')}
                textButtonApply={i18n('action_user-roles-change-apply')}
                onClickButtonCancel={onClose}
                onClickButtonApply={handleUpdateUserRoles}
                propsButtonCancel={{
                    disabled: isUpdateUserRoleLoading,
                }}
                propsButtonApply={{
                    loading: isUpdateUserRoleLoading,
                    disabled:
                        (userRoles?.length || 0) === roles.length &&
                        roles.every((role) => userRoles?.includes(role)),
                }}
            />
        </Dialog>
    );
}
