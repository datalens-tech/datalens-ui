import React, { useEffect, useState } from 'react';
import { Button, Icon, Select, Text, TextInput } from '@gravity-ui/uikit';
import {SegmentedRadioGroup as RadioButton} from '@gravity-ui/uikit';
import { I18n } from 'i18n';
import { Eye } from '@gravity-ui/icons';
import block from 'bem-cn-lite';

import './BaseAdminForm.scss';

const i18n = I18n.keyset('component.admin-pages');
const b = block('base-admin-form');

export const UserAdminFields = ({ values, stores, onChange }) => {
    const controlSize = 'l';
    const [showPassword, setShowPassword] = useState(false);
    if (values.b_base) {
        return <>
            <TextInput
                value={values.id || ''}
                size={controlSize}
                onChange={onChange}
                label={i18n('id')}
                name={'id'}
                disabled
                hasClear
            />
            <TextInput
                value={values.c_login || ''}
                size={controlSize}
                onChange={onChange}
                label={i18n('login')}
                name={'c_login'}
                disabled={Boolean(values?.id)}
                hasClear
            />
            {values.c_claims?.indexOf('oidc') >= 0 ? null : <TextInput
                value={values.c_password || ''}
                size={controlSize}
                onChange={onChange}
                endContent={<div className={b('eye-icon-wrapper')} onClick={()=>setShowPassword(!showPassword)}><Icon data={Eye} className={b('eye-icon')} /></div>}
                type={showPassword ? 'text' : 'password'}
                label={i18n('password')}
                name={'c_password'}
                hasClear
            />}
        </>
    }
    return <>
        <TextInput
            value={values.id || ''}
            size={controlSize}
            onChange={onChange}
            label={i18n('id')}
            name={'id'}
            disabled
            hasClear
        />
        <TextInput
            value={values.c_login || ''}
            size={controlSize}
            onChange={onChange}
            label={i18n('login')}
            name={'c_login'}
            disabled={Boolean(values?.id)}
            hasClear
        />
        <TextInput
            value={values.c_email || ''}
            size={controlSize}
            onChange={onChange}
            label={i18n('Email')}
            name={'c_email'}
            hasClear
        />
        <Select
            value={values.c_project_name || []}
            size={controlSize}
            label={i18n('project')}
            name={'c_project_name'}
            multiple={false}
            onUpdate={(value) => onChange({ target: { name: "c_project_name", value: value } })}
        >
            {stores.projects.map(item=>{
                return <Select.Option key={item.name} value={item.name}>{item.description || item.name}</Select.Option>
            })}
        </Select>
        {values.c_claims?.indexOf('oidc') >= 0 ? null : <TextInput
            value={values.c_password || ''}
            size={controlSize}
            onChange={onChange}
            endContent={<div className={b('eye-icon-wrapper')} onClick={()=>setShowPassword(!showPassword)}><Icon data={Eye} className={b('eye-icon')} /></div>}
            type={showPassword ? 'text' : 'password'}
            label={i18n('password')}
            name={'c_password'}
            hasClear
        />}
        <Select
            value={values.c_claims || []}
            size={controlSize}
            label={i18n('claims')}
            name={'c_claims'}
            multiple={true}
            onUpdate={(value) => onChange({ target: { name: "c_claims", value: value } })}
        >
            {stores.roles.map(item=>{
                return <Select.Option key={item.name} value={item.name}>{item.description || item.name}</Select.Option>
            })}
        </Select>
        {values.id && <RadioButton value={String(values.b_disabled)} onUpdate={(value) => onChange({ target: { name: "b_disabled", value: value } })}>
            <RadioButton.Option value={'false'}>
                {i18n('active')}
            </RadioButton.Option>
            <RadioButton.Option value={'true'}>
                {i18n('inactive')}
            </RadioButton.Option>
        </RadioButton>}
    </>
}