import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {Select} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import type {UserRole} from 'shared/components/auth/constants/role';

import {updateFormValues} from '../../store/actions/userInfoForm';
import {selectRoles} from '../../store/selectors/userInfoForm';
import {getSortedUsersRoles} from '../../utils/getSortedUsersRoles';
import {getRoleByKey} from '../../utils/userProfile';

import type {UserFormSelectProps} from './types';

import './formControls.scss';

const b = block('user-info-form-controls');

const i18n = I18n.keyset('auth.form-controls');

export const Roles = (props: UserFormSelectProps) => {
    const dispatch = useDispatch();

    const rolesOptions = React.useMemo(() => {
        const availableRoles = getSortedUsersRoles();
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
