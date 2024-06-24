import React from 'react';

import block from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import type {ConnectorType} from 'shared';

import {
    formSchemaSelector,
    getConnectorSchema,
    newConnectionSelector,
    schemaLoadingSelector,
    setSchema,
} from '../../store';
import {FormTitle} from '../FormTitle/FormTitle';
import {WrappedLoader} from '../WrappedLoader/WrappedLoader';

import {FormActions} from './FormActions/FormActions';
import {FormRow} from './FormRow/FormRow';

import './ConnectorForm.scss';

const b = block('conn-form');

type Props = {
    type: ConnectorType;
};

const mock = {
    title: 'ClickHouse',
    rows: [
        {
            type: 'mdb_form_fill',
        },
        {
            items: [
                {
                    id: 'description',
                    displayConditions: {
                        mdb_fill_mode: 'manually',
                    },
                    text: 'Указать реквизиты БД вручную. Для подключения через публичную сеть.',
                },
                {
                    id: 'description',
                    displayConditions: {
                        mdb_fill_mode: 'cloud',
                    },
                    text: 'Выбрать управляемую БД в текущей организации Yandex Cloud. Для подключения по внутренней сети.',
                },
            ],
        },
        {
            type: 'cloud_tree_select',
            displayConditions: {
                mdb_fill_mode: 'cloud',
            },
            name: 'mdb_folder_id',
        },
        {
            type: 'mdb_cluster',
            name: 'mdb_cluster_id',
            displayConditions: {
                mdb_fill_mode: 'cloud',
            },
            dbType: 'clickhouse',
        },
        {
            items: [
                {
                    id: 'hidden',
                    name: 'mdb_cluster_id',
                    displayConditions: {
                        mdb_fill_mode: 'manually',
                    },
                    defaultValue: '',
                },
                {
                    id: 'hidden',
                    name: 'mdb_folder_id',
                    displayConditions: {
                        mdb_fill_mode: 'manually',
                    },
                    defaultValue: '',
                },
            ],
        },
        {
            type: 'mdb_host',
            name: 'host',
            displayConditions: {
                mdb_fill_mode: 'cloud',
            },
            dbType: 'clickhouse',
        },
        {
            items: [
                {
                    id: 'label',
                    displayConditions: {
                        mdb_fill_mode: 'manually',
                    },
                    text: 'Имя хоста',
                },
                {
                    id: 'input',
                    name: 'host',
                    displayConditions: {
                        mdb_fill_mode: 'manually',
                    },
                    width: 'l',
                },
            ],
        },
        {
            items: [
                {
                    id: 'label',
                    text: 'Порт HTTP-интерфейса',
                    displayConditions: {
                        mdb_fill_mode: 'manually',
                    },
                },
                {
                    id: 'input',
                    name: 'port',
                    defaultValue: '8443',
                    width: 's',
                    controlProps: {
                        type: 'number',
                    },
                    displayConditions: {
                        mdb_fill_mode: 'manually',
                    },
                },
            ],
        },
        {
            items: [
                {
                    id: 'label',
                    text: 'Порт HTTP-интерфейса',
                    displayConditions: {
                        mdb_fill_mode: 'cloud',
                    },
                },
                {
                    id: 'input',
                    name: 'port',
                    defaultValue: '8443',
                    width: 's',
                    controlProps: {
                        type: 'number',
                    },
                    displayConditions: {
                        mdb_fill_mode: 'cloud',
                    },
                },
            ],
        },
        {
            items: [
                {
                    id: 'hidden',
                    name: 'sql_user_management',
                    inner: true,
                    defaultValue: false,
                },
            ],
        },
        {
            type: 'mdb_username',
            name: 'username',
            displayConditions: {
                mdb_fill_mode: 'cloud',
                sql_user_management: false,
            },
            dbType: 'clickhouse',
        },
        {
            items: [
                {
                    id: 'label',
                    displayConditions: {
                        mdb_fill_mode: 'cloud',
                        sql_user_management: true,
                    },
                    text: 'Имя пользователя',
                },
                {
                    id: 'input',
                    name: 'username',
                    displayConditions: {
                        mdb_fill_mode: 'cloud',
                        sql_user_management: true,
                    },
                    width: 'm',
                },
            ],
        },
        {
            items: [
                {
                    id: 'label',
                    displayConditions: {
                        mdb_fill_mode: 'manually',
                    },
                    text: 'Имя пользователя',
                },
                {
                    id: 'input',
                    name: 'username',
                    displayConditions: {
                        mdb_fill_mode: 'manually',
                    },
                    width: 'm',
                },
            ],
        },
        {
            items: [
                {
                    id: 'label',
                    text: 'Пароль',
                    displayConditions: {
                        mdb_fill_mode: 'manually',
                    },
                },
                {
                    id: 'input',
                    name: 'password',
                    defaultValue: '',
                    width: 'm',
                    controlProps: {
                        type: 'password',
                    },
                    displayConditions: {
                        mdb_fill_mode: 'manually',
                    },
                },
            ],
        },
        {
            items: [
                {
                    id: 'label',
                    text: 'Пароль',
                    displayConditions: {
                        mdb_fill_mode: 'cloud',
                    },
                },
                {
                    id: 'input',
                    name: 'password',
                    defaultValue: '',
                    width: 'm',
                    controlProps: {
                        type: 'password',
                    },
                    displayConditions: {
                        mdb_fill_mode: 'cloud',
                    },
                },
            ],
        },
        /////////
        {
            type: 'cloud_tree_select',
            displayConditions: {
                mdb_fill_mode: 'conn-manager',
            },
            name: 'mdb_folder_id',
            inner: true,
        },
        {
            type: 'connman_id',
            width: 'm',
            dbType: 'clickhouse',
            displayConditions: {
                mdb_fill_mode: 'conn-manager',
            },
        },
        {
            type: 'connman_host',
            name: 'connection_manager_host',
            width: 'm',
            displayConditions: {
                mdb_fill_mode: 'conn-manager',
            },
        },
        {
            type: 'connman_db',
            name: 'connection_manager_db',
            width: 'm',
            displayConditions: {
                mdb_fill_mode: 'conn-manager',
            },
        },
        {
            type: 'connman_username',
            width: 'm',
            displayConditions: {
                mdb_fill_mode: 'conn-manager',
            },
        },
        {
            type: 'connman_port',
            width: 'm',
            displayConditions: {
                mdb_fill_mode: 'conn-manager',
            },
        },
        ///////
        {
            type: 'cache_ttl_sec',
            name: 'cache_ttl_sec',
        },
        {
            items: [
                {
                    id: 'label',
                    text: 'Уровень доступа SQL запросов',
                    align: 'start',
                    helpText:
                        '- Не рекомендуем совмещать подзапросы в датасетах с RLS или каким-либо ограничением на просмотр таблиц.\n- SQL-запросы из чартов попадают напрямую в подключение и не учитывают настроенные RLS в датасетах.',
                },
                {
                    id: 'radio_group',
                    name: 'raw_sql_level',
                    options: [
                        {
                            content: {
                                text: 'Запретить',
                            },
                            value: 'off',
                        },
                        {
                            content: {
                                text: 'Разрешить подзапросы в датасетах',
                                hintText:
                                    'Опция позволяет описывать источники датасета с помощью SQL-запросов',
                            },
                            value: 'subselect',
                        },
                        {
                            content: {
                                text: 'Разрешить подзапросы в датасетах и запросы из чартов',
                                hintText:
                                    'Опция позволяет описывать источники датасета с помощью SQL-запросов и создавать QL-чарты',
                            },
                            value: 'dashsql',
                        },
                    ],
                    defaultValue: 'off',
                    controlProps: {},
                },
            ],
        },
        {
            type: 'collapse',
            name: 'advanced_settings',
            inner: true,
            text: 'Продвинутые настройки подключения',
        },
        {
            items: [
                {
                    id: 'label',
                    displayConditions: {
                        advanced_settings: 'opened',
                    },
                    text: 'TLS',
                    helpText:
                        'Когда опция включена, при взаимодействии с БД используется протокол HTTPS, когда выключена — HTTP',
                },
                {
                    id: 'radio_button',
                    name: 'secure',
                    displayConditions: {
                        advanced_settings: 'opened',
                    },
                    defaultValue: 'on',
                    options: [
                        {
                            text: 'Выкл',
                            value: 'off',
                        },
                        {
                            text: 'Вкл',
                            value: 'on',
                        },
                    ],
                },
            ],
        },
        {
            items: [
                {
                    id: 'label',
                    displayConditions: {
                        advanced_settings: 'opened',
                    },
                    text: 'CA Certificate',
                },
                {
                    id: 'file-input',
                    name: 'ssl_ca',
                    displayConditions: {
                        advanced_settings: 'opened',
                    },
                },
            ],
        },
        {
            items: [
                {
                    id: 'label',
                    displayConditions: {
                        advanced_settings: 'opened',
                    },
                    text: 'Запрет на экспорт данных',
                    helpText:
                        'При включении опции в чартах будет скрыта кнопка экспорта данных. При этом останется возможность извлекать данные из чартов, а также снимать скриншоты.',
                },
                {
                    id: 'radio_button',
                    name: 'data_export_forbidden',
                    displayConditions: {
                        advanced_settings: 'opened',
                    },
                    defaultValue: 'off',
                    options: [
                        {
                            text: 'Выкл',
                            value: 'off',
                        },
                        {
                            text: 'Вкл',
                            value: 'on',
                        },
                    ],
                },
            ],
        },
    ],
    apiSchema: {
        create: {
            items: [
                {
                    name: 'host',
                    required: true,
                    defaultAction: 'include',
                },
                {
                    name: 'port',
                    required: true,
                    defaultAction: 'include',
                },
                {
                    name: 'username',
                    required: false,
                    defaultAction: 'include',
                },
                {
                    name: 'password',
                    required: false,
                    defaultAction: 'include',
                },
                {
                    name: 'secure',
                    required: false,
                    defaultAction: 'include',
                },
                {
                    name: 'ssl_ca',
                    required: false,
                    defaultAction: 'include',
                },
                {
                    name: 'data_export_forbidden',
                    required: false,
                    defaultAction: 'include',
                },
                {
                    name: 'cache_ttl_sec',
                    required: false,
                    nullable: true,
                    defaultAction: 'include',
                },
                {
                    name: 'raw_sql_level',
                    required: false,
                    defaultAction: 'include',
                },
                {
                    name: 'mdb_cluster_id',
                    required: false,
                    nullable: true,
                    defaultAction: 'include',
                },
                {
                    name: 'type',
                    required: false,
                    defaultAction: 'include',
                },
            ],
            conditions: [],
        },
        check: {
            items: [
                {
                    name: 'host',
                    required: true,
                    defaultAction: 'include',
                },
                {
                    name: 'port',
                    required: true,
                    defaultAction: 'include',
                },
                {
                    name: 'username',
                    required: false,
                    defaultAction: 'include',
                },
                {
                    name: 'password',
                    required: false,
                    defaultAction: 'include',
                },
                {
                    name: 'secure',
                    required: false,
                    defaultAction: 'include',
                },
                {
                    name: 'ssl_ca',
                    required: false,
                    defaultAction: 'include',
                },
                {
                    name: 'data_export_forbidden',
                    required: false,
                    defaultAction: 'include',
                },
                {
                    name: 'type',
                    required: false,
                    defaultAction: 'include',
                },
                {
                    name: 'mdb_cluster_id',
                    required: false,
                    nullable: true,
                    defaultAction: 'include',
                },
            ],
            conditions: [],
        },
    },
};

export const ConnectorForm = ({type}: Props) => {
    const dispatch = useDispatch();
    const schema = useSelector(formSchemaSelector);
    const isNewConnection = useSelector(newConnectionSelector);
    const loading = useSelector(schemaLoadingSelector);

    React.useEffect(() => {
        if (!schema && !loading) {
            dispatch(getConnectorSchema(type));
        }
    }, [dispatch, type, schema, loading]);

    React.useEffect(() => {
        return () => {
            dispatch(setSchema({schema: undefined}));
        };
    }, [dispatch]);

    if (loading) {
        return <WrappedLoader />;
    }

    if (!schema) {
        return null;
    }

    return (
        <div className={b()}>
            <FormTitle type={type} title={mock.title} showArrow={isNewConnection} />
            <div className={b('rows')}>
                {mock.rows.map((row, i) => (
                    // @ts-ignore
                    <FormRow key={`row-${i}`} {...row} />
                ))}
            </div>
            <FormActions />
        </div>
    );
};
