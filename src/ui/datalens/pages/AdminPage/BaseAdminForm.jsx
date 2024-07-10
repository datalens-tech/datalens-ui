import React, { useEffect, useState } from 'react';
import { Button, Text, TextInput } from '@gravity-ui/uikit';
import { I18n } from 'i18n';
import './BaseAdminForm.scss';
import block from 'bem-cn-lite';

const i18n = I18n.keyset('component.admin-pages');



const b = block('base-admin-form');

export const BaseAdminForm = ({ className = "", title = "", loading = false, error = "", controlSize = 'l', fieldsComponent, record, stores = {}, onSave, onCancel }) => {
    const [values, setValues] = useState(record);

    useEffect(() => {
        setValues(record);
    }, [record]);

    function onChange(e) {
        setValues({ ...values, [e.target.name]: e.target.value })
    }

    return <div className={className}>
        <Text variant="subheader-3">{title}</Text>
        {
            error && <div className="alert alert-danger" role="alert" id="dl-admin-form-alert">
                {error}
            </div>
        }
        {
            loading && <div>
                {i18n('loading')}
            </div>
        }
        {React.createElement(fieldsComponent, { values, stores, onChange })}
        <div className={b('buttons-wrapper')}>
            <Button
                size={controlSize}
                onClick={() => onSave(values)}
                view="action"
            >
                {record?.id ? i18n('change') : i18n('create')}
            </Button>

            <Button
                size={controlSize}
                onClick={onCancel}
                view="flat"
            >
                {i18n('cancel')}
            </Button>
        </div>
    </div >
}