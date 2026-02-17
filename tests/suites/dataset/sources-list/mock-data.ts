import {v4 as uuidv4} from 'uuid';

export const requestUrls = {
    listingOptions: 'getSourceListingOptions',
    getSources: 'getSources',
    dbNames: 'getDbNames',
};

export const getSourceListingOptionsMock = {
    source_listing: {
        db_name_label: 'Каталог',
        db_name_required_for_search: true,
        supports_db_name_listing: true,
        supports_source_pagination: true,
        supports_source_search: true,
    },
};

export const dbNamesMock = {db_names: ['first', 'second', 'third', 'fourth']};

export const getSourcesMock = ({length = 101}: {length?: number} = {}) => {
    const sources = Array.from({length}, () => ({
        title: `${uuidv4()}`,
        group: ['samples'],
        source_type: 'CH_TABLE',
        connection_id: 'connectionId',
        parameters: {
            db_name: 'samples',
            table_name: 'tableName',
        },
        tab_title: null,
        form: null,
        disabled: false,
        parameter_hash: '',
    }));
    return {
        freeform_sources: [
            {
                title: 'Table',
                group: [],
                source_type: 'CH_TABLE',
                connection_id: '0sa8m0z2vqgqz',
                parameters: {},
                tab_title: 'Таблица',
                form: [
                    {
                        name: 'db_name',
                        input_type: 'text',
                        default: '',
                        required: true,
                        title: 'Имя базы данных',
                        template_enabled: false,
                    },
                    {
                        name: 'table_name',
                        input_type: 'text',
                        default: '',
                        required: true,
                        title: 'Имя таблицы',
                        field_doc_key: 'ANY_TABLE/table_name',
                        template_enabled: true,
                    },
                ],
                disabled: false,
                parameter_hash: '9703066baf02b43c',
            },
            {
                title: 'SQL',
                group: [],
                source_type: 'CH_SUBSELECT',
                connection_id: '0sa8m0z2vqgqz',
                parameters: {},
                tab_title: 'SQL',
                form: [
                    {
                        name: 'subsql',
                        input_type: 'sql',
                        default: 'select 1 as a',
                        required: true,
                        title: 'Подзапрос',
                        field_doc_key: 'ANY_SUBSELECT/subsql',
                        template_enabled: true,
                    },
                ],
                disabled: false,
                parameter_hash: 'abadd5788693fda8',
            },
        ],
        sources,
    };
};
