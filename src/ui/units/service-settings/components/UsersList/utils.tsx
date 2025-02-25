import React from 'react';

import type {TableColumnConfig} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import type {ListUser} from 'shared/schema/auth/types/users';

import {LabelsList} from './LabelsList/LabelsList';

const i18n = I18n.keyset('service-settings.users-list.view');

export const getUsersListColumns = (): TableColumnConfig<ListUser>[] => [
    {
        id: 'firstName',
        name: i18n('label_field-first-name'),
        template: ({firstName}) => firstName || '—',
    },
    {
        id: 'lastName',
        name: i18n('label_field-last-name'),
        template: ({lastName}) => lastName || '—',
    },
    {
        id: 'userId',
        name: i18n('label_field-id'),
        template: ({userId}) => userId,
        meta: {copy: ({userId}: ListUser) => userId},
    },
    {
        id: 'email',
        name: i18n('label_field-email'),
        template: ({email}) => email,
        meta: {copy: ({email}: ListUser) => email},
    },
    {
        id: 'role',
        name: i18n('label_field-roles'),
        template: ({roles}) => <LabelsList items={roles} countVisibleElements={1} />,
    },
    {
        id: 'login',
        name: i18n('label_field-login'),
        template: ({login}) => login,
        meta: {copy: ({login}: ListUser) => login},
    },
];
