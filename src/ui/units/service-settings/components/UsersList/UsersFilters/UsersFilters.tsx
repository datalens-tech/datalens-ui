import React from 'react';

import {Flex, Select, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import debounce from 'lodash/debounce';
import type {UserRole} from 'shared/components/auth/constants/role';
import {registry} from 'ui/registry';
import {getRoleByKey} from 'ui/units/auth/utils/userProfile';

import {BASE_USER_FILTERS} from '../constants';

import './UsersFilters.scss';

const b = block('service-settings-users-list-filters');
const i18n = I18n.keyset('service-settings.users-list.view');

const {getUsersRoles} = registry.auth.functions.getAll();

const ROLES_OPTIONS = Object.values(getUsersRoles()).map((key) => ({
    value: key,
    content: getRoleByKey(key),
}));

const UPDATE_FILTERS_TIMEOUT = 500;

type UsersFilterProps = {
    onChange: (filterName: string, filterValue: string | string[] | undefined) => void;
};

export const UsersFilter = ({onChange}: UsersFilterProps) => {
    const [search, setSearch] = React.useState('');
    const [roles, setRole] = React.useState<UserRole[]>([]);

    const {AdditionalFilters} = registry.auth.components.getAll();

    const sendUpdatedFilters = React.useMemo(
        () => debounce((name, value) => onChange(name, value), UPDATE_FILTERS_TIMEOUT),
        [onChange],
    );

    const handleSearchChange = (value: string) => {
        setSearch(value);
        sendUpdatedFilters(BASE_USER_FILTERS.FILTER_STRING, value);
    };

    const handleRoleChange = (value: string[]) => {
        setRole(value as UserRole[]);
        sendUpdatedFilters(BASE_USER_FILTERS.ROLES, value);
    };

    return (
        <Flex gap={2} className={b()}>
            <TextInput
                value={search}
                onUpdate={handleSearchChange}
                hasClear={true}
                placeholder={i18n('label_search-placeholder')}
                className={b('filter')}
            />
            <Select
                options={ROLES_OPTIONS}
                value={roles}
                hasClear={true}
                onUpdate={handleRoleChange}
                label={i18n('label_field-roles')}
                className={b('filter')}
            />
            <IdpUsersFilter onChange={onChange} className={b('filter')} />
        </Flex>
    );
};
