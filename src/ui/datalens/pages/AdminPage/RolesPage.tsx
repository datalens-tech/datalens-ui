import React, { useEffect, useState } from 'react';
import Utils from 'ui/utils';
import { I18n } from 'i18n';
import { Table, Button, Text, Loader } from '@gravity-ui/uikit';
import { BaseAdminForm } from './BaseAdminForm';
import { BaseAdminFields } from './BaseAdminFields';
import block from 'bem-cn-lite';
import './BaseAdmin.scss';
import { BaseAdminPageToolbar } from './BaseAdminPageToolbar';

const i18n = I18n.keyset('component.admin-pages');

const b = block('base-admin');

interface Role {
  id: string,
  constant: string,
  name: string
}

const RolesTables = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [record, setRecord] = useState<Role | null>(null);

  const columns = [
    { id: 'role_id', name: 'ID' },
    { id: 'description', name: i18n('name') },
    { id: 'name', name: i18n('constant'), },
    { id: 'isbase', name: i18n('is_base'), template: (item: any) => item.isbase ? i18n('yes') : i18n('no') },
    {
      id: 'action', name: i18n('action'), template: (item: any) => item.isbase ? null : <Button onClick={onEdit(item)} size="m">{i18n("change")}</Button>
    },
  ];

  async function loadData() {
    const roles = await Utils.universalService({ "action": "datalens", "method": "roles", "data": [{}] });
    return roles;
  }

  function onEdit(item: any) {
    return () => setRecord({
      id: item.role_id,
      constant: item.name,
      name: item.description,
    })
  }

  function onCreate() {
    setRecord({
      id: '',
      constant: '',
      name: ''
    })
  }

  function onRefresh() {
    setLoading(true);
    loadData().then((roles)=>{
      setData(roles.data);
    }).finally(() => {
      setLoading(false);
    });
    setRecord(null);
  }

  async function onSave(values: any) {
    const { err } = await Utils.universalService({ "action": "datalens", "method": "add_or_update_role", "data": [{ id: values.id, c_name: values.constant, c_description: values.name }] });
    if (err) {
      return setError(err);
    }
    loadData().then((roles) => {
      setData(roles.data);
    });
    setRecord(null);
  }

  useEffect(() => {
    loadData().then((roles) => {
      setData(roles.data);
    })
  }, []);

  return <div className={b("wrapper")}>
    <Text className={b("title")} variant="header-1">{i18n("roles")}</Text>
    <div className="alert alert-light" role="alert">
      {i18n("alert_message")}
    </div>
    <BaseAdminPageToolbar onCreate={onCreate} onRefresh={onRefresh} />
    <div className={b("container")}>
      {loading ? <Loader className={b("table")} /> : <Table data={data} columns={columns} className={b("table")} />}
      {record && <BaseAdminForm
        error={error}
        className={b("form")}
        title={record?.id ? i18n('edit_role') : i18n('create_role')}
        record={record} fieldsComponent={BaseAdminFields}
        onSave={onSave}
        onCancel={() => setRecord(null)}
      />}
    </div>
  </div>
}

export default RolesTables;
