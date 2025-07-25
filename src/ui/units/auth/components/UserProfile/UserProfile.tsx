import * as React from 'react';

import {Button, DefinitionList, Flex, Text, spacing} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {useHistory} from 'react-router';
import type {UserProfile as UserProfileType} from 'shared/schema/auth/types/users';
import {DL} from 'ui/constants';
import {registry} from 'ui/registry';
import {UserRoleLabel} from 'ui/units/auth/components/UserRoleLabel/UserRoleLabel';

import {ChangePasswordDialog} from '../ChangePasswordDialog/ChangePasswordDialog';
import {ChangeUserRoleDialog} from '../ChangeUserRoleDialog/ChangeUserRoleDialog';
import {DeleteUserDialog} from '../DeleteUserDialog/DeleteUserDialog';
import {EditUserProfileDialog} from '../EditUserProfileDialog/EditUserProfileDialog';

const i18n = I18n.keyset('auth.user-profile.view');

interface UserProfileProps {
    userProfile?: UserProfileType;
    onUserDataChange: () => void;
}

export function UserProfile({userProfile, onUserDataChange}: UserProfileProps) {
    const history = useHistory();

    const [assignRoleDialogOpen, setAssignRoleDialogOpen] = React.useState(false);
    const [deleteUserDialogOpen, setDeleteUserDialogOpen] = React.useState(false);
    const [updateUserPasswordOpen, setUpdateUserPasswordOpen] = React.useState(false);
    const [editUserProfileDialogOpen, setEditUserProfileDialogOpen] = React.useState(false);

    const handleUserDeleteSuccess = React.useCallback(() => {
        history.push('/settings/users');
    }, [history]);

    if (!userProfile) {
        return null;
    }

    const {login, email, firstName, lastName, userId: id, roles, idpType} = userProfile;
    const canChangeUserData = DL.IS_NATIVE_AUTH_ADMIN;
    const isCurrentUserProfile = DL.USER_ID === id;

    const disableActions = DL.AUTH_MANAGE_LOCAL_USERS_DISABLED || Boolean(idpType);
    const showAdministrationActions = !disableActions && canChangeUserData && !isCurrentUserProfile;

    const {getAdditionalProfileFields, getAdditionalProfileSections} =
        registry.auth.functions.getAll();

    const additionalProfileFields = getAdditionalProfileFields?.(userProfile)?.map((field) => (
        <DefinitionList.Item name={field.name} key={field.name}>
            {field.value}
        </DefinitionList.Item>
    ));

    return (
        <Flex direction="column" gap={10} width={490}>
            <Section
                title={i18n('title_profile')}
                disableActions={disableActions}
                actions={
                    <React.Fragment>
                        {canChangeUserData && (
                            <Button onClick={() => setEditUserProfileDialogOpen(true)}>
                                {i18n('action_edit-profile')}
                            </Button>
                        )}
                        <Button onClick={() => setUpdateUserPasswordOpen(true)}>
                            {i18n('action_change-password')}
                        </Button>
                    </React.Fragment>
                }
            >
                <DefinitionList>
                    <DefinitionList.Item name={i18n('label_first-name')}>
                        {firstName}
                    </DefinitionList.Item>
                    <DefinitionList.Item name={i18n('label_last-name')}>
                        {lastName}
                    </DefinitionList.Item>
                    <DefinitionList.Item name={i18n('label_login')}>{login}</DefinitionList.Item>
                    <DefinitionList.Item name={i18n('label_email')}>{email}</DefinitionList.Item>
                    <DefinitionList.Item name={i18n('label_user-id')}>{id}</DefinitionList.Item>
                    {additionalProfileFields}
                </DefinitionList>

                <ChangePasswordDialog
                    open={updateUserPasswordOpen}
                    onClose={() => setUpdateUserPasswordOpen(false)}
                    userId={id}
                    isOwnProfile={isCurrentUserProfile}
                    onSuccess={onUserDataChange}
                />
                <EditUserProfileDialog
                    open={editUserProfileDialogOpen}
                    onClose={() => setEditUserProfileDialogOpen(false)}
                    userId={id}
                    email={email}
                    firstName={firstName}
                    lastName={lastName}
                    onSuccess={onUserDataChange}
                />
            </Section>
            <Section
                title={i18n('title_permissions')}
                actions={
                    canChangeUserData && (
                        <Button onClick={() => setAssignRoleDialogOpen(true)}>
                            {i18n('action_assign-role')}
                        </Button>
                    )
                }
                disableActions={disableActions}
            >
                <DefinitionList>
                    <DefinitionList.Item name={i18n('label_role')}>
                        {roles?.length ? (
                            <Flex gap={1}>
                                {roles?.map((role) => <UserRoleLabel key={role} role={role} />)}
                            </Flex>
                        ) : null}
                    </DefinitionList.Item>
                </DefinitionList>
                <ChangeUserRoleDialog
                    open={assignRoleDialogOpen}
                    onClose={() => setAssignRoleDialogOpen(false)}
                    userId={id}
                    userRoles={roles}
                />
            </Section>

            {getAdditionalProfileSections(userProfile).map(({title, section}) => (
                <Section key={title} title={title}>
                    {section}
                </Section>
            ))}

            {showAdministrationActions && (
                <Section
                    title={i18n('title_administration')}
                    actions={
                        <Button
                            onClick={() => setDeleteUserDialogOpen(true)}
                            view="outlined-danger"
                        >
                            {i18n('action_delete-user')}
                        </Button>
                    }
                    disableActions={disableActions}
                >
                    <DeleteUserDialog
                        open={deleteUserDialogOpen}
                        onClose={() => setDeleteUserDialogOpen(false)}
                        onSuccess={handleUserDeleteSuccess}
                        userId={id}
                    />
                </Section>
            )}
        </Flex>
    );
}

const HEADER_TAG = 'h3' as const;
function Section({
    title,
    actions,
    children,
    disableActions,
}: {
    title: string;
    actions?: React.ReactNode;
    children: React.ReactNode;
    disableActions?: boolean;
}) {
    const showActions = !disableActions && actions;
    return (
        <section>
            <Text as={HEADER_TAG} variant="subheader-3" className={spacing({mb: 3})}>
                {title}
            </Text>
            {children}
            {showActions && (
                <Flex gap={2} className={spacing({mt: 3})}>
                    {actions}
                </Flex>
            )}
        </section>
    );
}
