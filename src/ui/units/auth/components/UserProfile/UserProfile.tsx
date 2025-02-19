import * as React from 'react';

import {Button, DefinitionList, Flex, Text, spacing} from '@gravity-ui/uikit';
import {I18n, i18n as i18nInitial} from 'i18n';
import type {UserRole} from 'shared/components/auth/constants/role';
import {DL} from 'ui/constants';
import {UserRoleLabel} from 'ui/units/auth/components/UserRoleLabel/UserRoleLabel';

import {ChangePasswordDialog} from '../ChangePasswordDialog/ChangePasswordDialog';
import {DeleteUserDialog} from '../DeleteUserDialog/DeleteUserDialog';

const i18n = I18n.keyset('auth.user-profile.view');

interface UserProfileProps {
    firstName?: string;
    lastName?: string;
    login: string | null;
    email: string | null;
    id: string;
    roles?: `${UserRole}`[];
}

export function UserProfile({firstName, lastName, login, email, id, roles}: UserProfileProps) {
    const canChangeUserData = DL.IS_NATIVE_AUTH_ADMIN;
    const isCurrentUserProfile = DL.USER_ID === id;

    const [deleteUserDialogOpen, setDeleteUserDialogOpen] = React.useState(false);
    const [updateUserPasswordOpen, setUpdateUserPasswordOpen] = React.useState(false);

    return (
        <Flex direction="column" gap={10} width={490}>
            <Section
                title={i18n('title_profile')}
                actions={
                    canChangeUserData && (
                        <React.Fragment>
                            <Button>{i18n('action_edit-profile')}</Button>
                            <Button onClick={() => setUpdateUserPasswordOpen(true)}>
                                {i18n('action_change-password')}
                            </Button>
                        </React.Fragment>
                    )
                }
            >
                <DefinitionList>
                    <DefinitionList.Item
                        // TODO: @darialari - replace keyset
                        name={i18nInitial('auth.form-controls', 'label_first-name')}
                    >
                        {firstName}
                    </DefinitionList.Item>
                    <DefinitionList.Item
                        // TODO: @darialari - replace keyset
                        name={i18nInitial('auth.form-controls', 'label_last-name')}
                    >
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
                />
            </Section>
            <Section
                title={i18n('title_permissions')}
                actions={canChangeUserData && <Button>{i18n('action_assign-role')}</Button>}
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
    return (
        <section>
            <Text as={HEADER_TAG} variant="subheader-3" className={spacing({mb: 3})}>
                {title}
            </Text>
            {children}
            {actions && (
                <Flex gap={2} className={spacing({mt: 3})}>
                    {actions}
                </Flex>
            )}
        </section>
    );
}
