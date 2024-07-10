import React, { useEffect, useState } from 'react';
import { Button, Text, TextInput } from '@gravity-ui/uikit';
import { I18n } from 'i18n';

const i18n = I18n.keyset('component.admin-pages');

export const BaseAdminFields = ({values, onChange}) => {
    const controlSize = 'l';
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
            value={values.constant || ''}
            size={controlSize}
            onChange={onChange}
            label={i18n('constant')}
            name={'constant'}
            hasClear
        />
        <TextInput
            value={values.name || ''}
            size={controlSize}
            onChange={onChange}
            label={i18n('name')}
            name={'name'}
            hasClear
        />
    </>
}