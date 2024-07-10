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

const ProjectTables = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState([]);
  const [record, setRecord] = useState<Object | null>(null);

  const columns = [
    { id: 'project_id', name: 'ID' },
    { id: 'description', name: i18n('name') },
    { id: 'name', name: i18n('constant'), },
    { id: 'isbase', name: i18n('is_base'), template: (item: any) => item.isbase ? i18n('yes') : i18n('no') },
    {
      id: 'action', name: i18n('action'), template: (item: any) => item.isbase ? null : <Button onClick={onEdit(item)} size="m">{i18n("change")}</Button>
    },
  ];

  async function loadData() {
    const projects = await Utils.universalService({ "action": "datalens", "method": "projects", "data": [{}] });
    return projects;
  }

  function onEdit(item: any) {
    return () => setRecord({
      id: item.project_id,
      constant: item.name,
      name: item.description,
    })
  }

  async function onSave(values: any) {
    const { err } = await Utils.universalService({ "action": "datalens", "method": "add_or_update_project", "data": [{ id: values.id, c_name: values.constant, c_description: values.name }] });
    if (err) {
      return setError(err);
    }
    loadData().then((projects) => {
      setData(projects.data);
    });
    setRecord(null);
  }

  useEffect(() => {
    loadData().then((projects) => {
      setData(projects.data);
    })
  }, []);

  function onCreate() {
    setRecord({
      id: '',
      constant: '',
      name: ''
    })
  }

  function onRefresh() {
    setLoading(true);
    loadData().then((projects)=>{
      setData(projects.data);
    }).finally(() => {
      setLoading(false);
    });
    setRecord(null);
  }


  return <div className={b("wrapper")}>
    <Text className={b("title")} variant="header-1">{i18n("projects")}</Text>
    <div className="alert alert-light" role="alert">
      {i18n("alert_message")}
    </div>
    <BaseAdminPageToolbar onCreate={onCreate} onRefresh={onRefresh} />
    <div className={b("container")}>
      {loading ? <Loader className={b("table")} /> : <Table data={data} columns={columns} className={b("table")} />}
      {record && <BaseAdminForm
        error={error}
        title={i18n('edit_project')}
        className={b("form")}
        record={record} fieldsComponent={BaseAdminFields}
        onSave={onSave}
        onCancel={() => setRecord(null)}
      />}
    </div></div>

}

export default ProjectTables;
