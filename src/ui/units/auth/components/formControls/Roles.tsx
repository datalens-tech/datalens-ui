import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {Select} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import type {UserRole} from 'shared/components/auth/constants/role';
import {registry} from 'ui/registry';

import {updateFormValues} from '../../store/actions/userInfoForm';
import {selectRoles} from '../../store/selectors/userInfoForm';
import {getRoleByKey} from '../../utils/userProfile';

import type {UserFormSelectProps} from './types';

import './formControls.scss';

const b = block('user-info-form-controls');

// TODO: add title to translations
// const i18n = I18n.keyset('auth.user-form-controls.view');
const i18n = (key: string) => {
    switch (key) {
        case 'label_roles':
            return 'Role';
        default:
            return key;
    }
};

export const Roles = (props: UserFormSelectProps) => {
    const dispatch = useDispatch();

    const rolesOptions = React.useMemo(() => {
        const {getUsersRoles} = registry.auth.functions.getAll();
        const availableRoles = getUsersRoles();
        return Object.values(availableRoles).map((key) => ({
            value: key,
            content: getRoleByKey(key),
        }));
    }, []);

    const roles = useSelector(selectRoles);

    const handleUpdate = (value: string[]) =>
        dispatch(updateFormValues({roles: value as `${UserRole}`[]}));

    return (
        <FormRow label={i18n('label_roles')} className={b('row', props.rowClassName)}>
            <Select
                value={roles}
                onUpdate={handleUpdate}
                options={rolesOptions}
                width="max"
                {...props}
            />
        </FormRow>
    );
};
