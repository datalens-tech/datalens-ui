import React, { useEffect, useState } from 'react';
import Utils from 'ui/utils';
import { I18n } from 'i18n';
import { Table, Button, Text, Loader, TextInput } from '@gravity-ui/uikit';
import { BaseAdminForm } from './BaseAdminForm';
import { UserAdminFields } from './UserAdminFields';
import block from 'bem-cn-lite';
import './BaseAdmin.scss';

const i18n = I18n.keyset('component.admin-pages');

const b = block('base-admin');

export const UsersPageToolbar = ({onSearch, onCreate, onRefresh}) => {
    const [search, setSearch] = useState("");

    return <div className={b("toolbar")}>
        <TextInput
            value={search}
            size={'l'}
            onUpdate={(value)=>setSearch(value)}
            label={i18n('search')}
            hasClear
        />
        <Button
            size={'l'}
            onClick={()=>onSearch(search)}
            view="action"
        >
            {i18n('search')}
        </Button>
        <Button
            size={'l'}
            onClick={onCreate}
            view="action"
        >
            {i18n('create')}
        </Button>
        <Button
            size={'l'}
            onClick={onRefresh}
            view="flat"
        >
            {i18n('refresh')}
        </Button>
    </div>
}