import * as React from 'react';

import {Button, DefinitionList, Flex, Text, spacing} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {useHistory} from 'react-router';
import type {UserRole} from 'shared/components/auth/constants/role';
import {DL} from 'ui/constants';
import {UserRoleLabel} from 'ui/units/auth/components/UserRoleLabel/UserRoleLabel';

import {ChangePasswordDialog} from '../ChangePasswordDialog/ChangePasswordDialog';
import {ChangeUserRoleDialog} from '../ChangeUserRoleDialog/ChangeUserRoleDialog';
import {DeleteUserDialog} from '../DeleteUserDialog/DeleteUserDialog';
import {EditUserProfileDialog} from '../EditUserProfileDialog/EditUserProfileDialog';

const i18n = I18n.keyset('auth.user-profile.view');

interface UserProfileProps {
    firstName?: string;
    lastName?: string;
    login: string | null;
    email: string | null;
    id: string;
    roles?: `${UserRole}`[];
    onUserDataChange: () => void;
}

export function UserProfile({
    firstName,
    lastName,
    login,
    email,
    id,
    roles,
    onUserDataChange,
}: UserProfileProps) {
    const canChangeUserData = DL.IS_NATIVE_AUTH_ADMIN;
    const isCurrentUserProfile = DL.USER_ID === id;

    const history = useHistory();

    const [assignRoleDialogOpen, setAssignRoleDialogOpen] = React.useState(false);
    const [deleteUserDialogOpen, setDeleteUserDialogOpen] = React.useState(false);
    const [updateUserPasswordOpen, setUpdateUserPasswordOpen] = React.useState(false);
    const [editUserProfileDialogOpen, setEditUserProfileDialogOpen] = React.useState(false);

    const handleUserDeleteSuccess = React.useCallback(() => {
        history.push('/settings/users');
    }, [history]);

    return (
        <Flex direction="column" gap={10} width={490}>
            <Section
                title={i18n('title_profile')}
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

            {canChangeUserData && !isCurrentUserProfile && (
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
}: {
    title: string;
    actions?: React.ReactNode;
    children: React.ReactNode;
}) {
    const showActions = !DL.DISABLE_USER_EDIT && Boolean(actions);
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
