import * as React from 'react';

import {Button, DefinitionList, Flex, Text, spacing} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import type {UserRole} from 'shared/components/auth/constants/role';
import {DL} from 'ui/constants';
import {UserRoleLabel} from 'ui/units/auth/components/UserRoleLabel/UserRoleLabel';

import {DeleteUserDialog} from '../DeleteUserDialog/DeleteUserDialog';

const i18n = I18n.keyset('auth.user-profile.view');

interface UserProfileProps {
    displayName: string;
    login: string | null;
    email: string | null;
    id: string;
    roles?: `${UserRole}`[];
}

export function UserProfile({displayName, login, email, id, roles}: UserProfileProps) {
    const canChangeUserData = DL.IS_NATIVE_AUTH_ADMIN;

    const [deleteUserDialogOpen, setDeleteUserDialogOpen] = React.useState(false);

    return (
        <Flex direction="column" gap={10} width={490}>
            <Section
                title={i18n('title_profile')}
                actions={
                    canChangeUserData && (
                        <React.Fragment>
                            <Button>{i18n('action_edit-profile')}</Button>
                            <Button>{i18n('action_change-password')}</Button>
                        </React.Fragment>
                    )
                }
            >
                <DefinitionList>
                    <DefinitionList.Item name={i18n('label_name')}>
                        {displayName}
                    </DefinitionList.Item>
                    <DefinitionList.Item name={i18n('label_login')}>{login}</DefinitionList.Item>
                    <DefinitionList.Item name={i18n('label_email')}>{email}</DefinitionList.Item>
                    <DefinitionList.Item name={i18n('label_user-id')}>{id}</DefinitionList.Item>
                </DefinitionList>
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

            {canChangeUserData && (
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
