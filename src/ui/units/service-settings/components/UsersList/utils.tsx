import React from 'react';

import {type TableColumnConfig, User} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {Feature} from 'shared';
import type {ListUser} from 'shared/schema/auth/types/users';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {LabelsList} from './LabelsList/LabelsList';

const b = block('service-settings-users-list');

const i18n = I18n.keyset('service-settings.users-list.view');

const newServiceSettingsEnabled = isEnabledFeature(Feature.EnableNewServiceSettings);

export const getUsersListColumns = (): TableColumnConfig<ListUser>[] =>
    newServiceSettingsEnabled
        ? [
              {
                  id: 'user',
                  name: 'Пользователь',
                  template: ({firstName, lastName, email}) => (
                      <User
                          size="m"
                          name={`${firstName ?? ''} ${lastName ?? ''}`.trim() || '—'}
                          description={email || '—'}
                      />
                  ),
                  className: b('column-user'),
              },
              {
                  id: 'role',
                  name: i18n('label_field-roles'),
                  template: ({roles}) => <LabelsList items={roles} countVisibleElements={1} />,
              },
              {
                  id: 'login',
                  name: i18n('label_field-login'),
                  meta: {copy: ({login}: ListUser) => login},
              },
              {
                  id: 'userId',
                  name: i18n('label_field-id'),
                  template: ({userId}) => userId,
                  meta: {copy: ({userId}: ListUser) => userId},
              },
          ]
        : [
              {
                  id: 'firstName',
                  name: i18n('label_field-first-name'),
              },
              {
                  id: 'lastName',
                  name: i18n('label_field-last-name'),
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
                  meta: {copy: ({login}: ListUser) => login},
              },
          ];
