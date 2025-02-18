import React from 'react';

import {Dialog, Flex, Select, Text} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from 'react-redux';
import type {UserRole} from 'shared/components/auth/constants/role';
import {registry} from 'ui/registry';
import type {AppDispatch} from 'ui/store';

import {updateUserRoles} from '../../store/actions/userProfile';
import {selectAssignUserRoleIsLoading} from '../../store/selectors/userProfile';
import {getRoleByKey} from '../../utils/userProfile';
// import {I18n, i18n} from 'i18n';

// TODO: add translations
// const i18n = I18n.keyset('auth.dialog-change-user-role');

const i18n = (key: string) => {
    switch (key) {
        case 'title_assign-role':
            return 'Assign role';
        case 'label_select-role':
            return 'Select role';
        case 'label_failed-to-change-roles':
            return 'Failed to change user roles';
        case 'action_user-roles-change-cancel':
            return 'Cancel';
        case 'action_user-roles-change-apply':
            return 'Save';
        case 'label_base-role':
            return 'Base role';
        case 'label_includes-permissions-from':
            return 'Extends permissions of';
        default:
            return key;
    }
};

const {getUsersRoles} = registry.auth.functions.getAll();

const EXISITING_ROLES = getUsersRoles().reverse();

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
                {i18n('label_includes-permissions-from')}{' '}
                <Text variant="code-inline-1">{getRoleByKey(rolesList[i - 1])}</Text>
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
}

export function ChangeUserRoleDialog({
    userId,
    userRoles,
    open,
    onClose,
}: ChangeUserRoleDialogProps) {
    const dispatch = useDispatch<AppDispatch>();

    const isAssignUserRoleLoading = useSelector(selectAssignUserRoleIsLoading);

    const initialRole = getMaxRoleOfSelected(userRoles);
    const [roles, setRoles] = React.useState(initialRole ? [initialRole] : []);

    const handleAssignUserRoles = () => {
        dispatch(updateUserRoles({userId, oldRoles: userRoles, newRoles: roles}));
    };

    const handleUserRolesChange = React.useCallback((value: string[]) => {
        setRoles(value as UserRole[]);
    }, []);

    const withSeveralInitialRoles = (userRoles?.length ?? 0) > 1;

    return (
        <Dialog open={open} onClose={onClose} size="s">
            <Dialog.Header caption={i18n('title_assign-role')} />
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
                onClickButtonApply={handleAssignUserRoles}
                propsButtonCancel={{
                    disabled: isAssignUserRoleLoading,
                }}
                propsButtonApply={{
                    loading: isAssignUserRoleLoading,
                    disabled:
                        (userRoles?.length || 0) === roles.length &&
                        roles.every((role) => userRoles?.includes(role)),
                }}
            />
        </Dialog>
    );
}
