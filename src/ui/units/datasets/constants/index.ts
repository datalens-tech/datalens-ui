import {i18n} from 'i18n';
import type {EntryScope} from 'shared';
import {DL} from 'ui';

import {getFakeEntry as genericGetFakeEntry} from '../../../components/ActionPanel';

import iconJoinFullOuter from '../icons/join-full-outer.svg';
import iconJoinInner from '../icons/join-inner.svg';
import iconJoinLeft from '../icons/join-left.svg';
import iconJoinRight from '../icons/join-right.svg';

export * from './datasets';

const _getSelectItemTitle = (): Record<string, string> => ({
    visits: i18n('connections.form', 'value_counter-source-visits'),
    hits: i18n('connections.form', 'value_counter-source-hits'),
    hahn: i18n('connections.form', 'value_cluster-hahn'),
    arnold: i18n('connections.form', 'value_cluster-arnold'),
    vanga: i18n('connections.form', 'value_cluster-vanga'),
    owner_only: i18n('connections.form', 'value_permission-owner-only'),
    explicit: i18n('connections.form', 'value_permission-explicit'),
    installs: i18n('connections.form', 'value_metrica-namespace-installs'),
    audience: i18n('connections.form', 'value_metrica-namespace-audience'),
    client_events: i18n('connections.form', 'value_metrica-namespace-client-events'),
    push_events: i18n('connections.form', 'value_metrica-namespace-push-events'),
    audience_socdem: i18n('connections.form', 'value_metrica-namespace-audience-socdem'),
    clicks: i18n('connections.form', 'value_metrica-namespace-clicks'),
    installations: i18n('connections.form', 'value_metrica-namespace-installations'),
    postbacks: i18n('connections.form', 'value_metrica-namespace-postbacks'),
    events: i18n('connections.form', 'value_metrica-namespace-events'),
    profiles: i18n('connections.form', 'value_metrica-namespace-profiles'),
    revenue_events: i18n('connections.form', 'value_metrica-namespace-revenue-events'),
    deeplinks: i18n('connections.form', 'value_metrica-namespace-deeplinks'),
    crashes: i18n('connections.form', 'value_metrica-namespace-crashes'),
    errors: i18n('connections.form', 'value_metrica-namespace-errors'),
    push_tokens: i18n('connections.form', 'value_metrica-namespace-push-tokens'),
    sessions_starts: i18n('connections.form', 'value_metrica-namespace-sessions-starts'),
});

export const getStaticSelectItems = (values: string[]) => {
    return values.map((value) => {
        return {
            key: value,
            value,
            title: _getSelectItemTitle()[value],
        };
    });
};
export const getAppMetricGroupNameI18n = (key: string) => _getSelectItemTitle()[key];

export const getFakeEntry = (
    scope: EntryScope.Connection | EntryScope.Dataset,
    workbookId?: string,
    searchCurrentPath?: string,
) => {
    let path = searchCurrentPath || DL.USER_FOLDER;

    path = path.endsWith('/') ? path : `${path}/`;

    return genericGetFakeEntry({
        key: `${path}${i18n('connections.form', `section_creation-${scope}`)}`,
        workbookId,
        fakeName: i18n('connections.form', `section_creation-${scope}`),
    });
};

export const VALUES = {
    SORT_SEQUENCE: ['none', 'asc', 'desc', 'none'],
    SORT: {
        NONE: 'none',
        DESC: 'desc',
        ASC: 'asc',
    },
    SORTS: ['desc', 'asc'],
};

export const TOAST_TYPES = {
    CREATE_CONNECTION: 'createConnection',
    MODIFY_CONNECTION: 'modifyConnection',
    VERIFY_CONNECTION: 'verifyConnection',
    SELECT_CONNECTION: 'selectConnection',
    REPLACE_CONNECTION: 'replaceConnection',
    CREATE_DATASET: 'createDataset',
    UPLOAD_CSV: 'uploadCsv',
    SAVE_CSV: 'saveCsv',
};

export const FIELD_PROPERTIES = {
    NAME: 'name',
    GUID: 'guid',
    TYPE: 'type',
    CAST: 'cast',
    AGGREGATION: 'aggregation',
    SOURCE: 'source',
    TITLE: 'title',
    DESCRIPTION: 'description',
    HIDE_FLAG: 'hidden',
    FORMULA: 'formula',
};

export const COUNTER_INPUT_METHODS = {
    LIST: 'from_list',
    MANUALLY: 'manually',
};

export const METRICA_NAMESPACES = {
    METRICA: ['visits', 'hits'],
    APPMETRICA_API: ['installs', 'audience', 'client_events', 'push_events', 'audience_socdem'],
    APPMETRICA_LOGS_API: [
        'clicks',
        'installations',
        'postbacks',
        'events',
        'profiles',
        'revenue_events',
        'deeplinks',
        'crashes',
        'errors',
        'push_tokens',
        'sessions_starts',
    ],
};

export const TOAST_TIMEOUT_DEFAULT = 60000;
export const MILLISECONDS_IN_DAY = 86400000;

export const TOAST_NAME = 'dialog_footer_error';

export const TAB_DATASET = 'dataset';
export const TAB_SOURCES = 'sources';
export const TAB_FILTERS = 'filters';
export const TAB_PARAMETERS = 'parameters';
export type DatasetTab =
    | typeof TAB_DATASET
    | typeof TAB_SOURCES
    | typeof TAB_FILTERS
    | typeof TAB_PARAMETERS;
export const DATASET_TABS = [TAB_DATASET, TAB_SOURCES, TAB_FILTERS, TAB_PARAMETERS];

export const CH_OVER_YT = 'CHYT_TABLE';

export const ACCURACY_VALUES = [null, 0.001, 0.01, 0.1, 1];
export const ACCURACY_AUTO = 'auto';

export const DND_ITEM_TYPES = {
    AVATAR: 'avatar',
};

export const SVG_NAMESPACE_URI = 'http://www.w3.org/2000/svg';

export const BINARY_JOIN_OPERATORS = {
    GT: 'gt',
    LT: 'lt',
    GTE: 'gte',
    LTE: 'lte',
    EQ: 'eq',
    NE: 'ne',
} as const;

export const JOIN_TYPES = {
    INNER: 'inner',
    FULL: 'full',
    LEFT: 'left',
    RIGHT: 'right',
};

export const JOIN_TYPES_ICONS = {
    [JOIN_TYPES.INNER]: {
        iconData: iconJoinInner,
    },
    [JOIN_TYPES.LEFT]: {
        iconData: iconJoinLeft,
    },
    [JOIN_TYPES.RIGHT]: {
        iconData: iconJoinRight,
    },
    [JOIN_TYPES.FULL]: {
        iconData: iconJoinFullOuter,
    },
};

export const DATASET_UPDATE_ACTIONS = {
    FIELD_ADD: 'add_field',
    FIELD_UPDATE: 'update_field',
    FIELD_DELETE: 'delete_field',

    SOURCE_ADD: 'add_source',
    SOURCE_UPDATE: 'update_source',
    SOURCE_DELETE: 'delete_source',
    SOURCE_REFRESH: 'refresh_source',
    SOURCES_REFRESH: 'sources_refresh',
    SOURCE_REPLACE: 'source_replace',
    CONNECTION_REPLACE: 'replace_connection',

    AVATAR_ADD: 'add_source_avatar',
    AVATAR_UPDATE: 'update_source_avatar',
    AVATAR_DELETE: 'delete_source_avatar',

    RELATION_ADD: 'add_avatar_relation',
    RELATION_UPDATE: 'update_avatar_relation',
    RELATION_DELETE: 'delete_avatar_relation',

    OBLIGATORY_FILTER_ADD: 'add_obligatory_filter',
    OBLIGATORY_FILTER_UPDATE: 'update_obligatory_filter',
    OBLIGATORY_FILTER_DELETE: 'delete_obligatory_filter',
};

export const CONDITION_TYPES = {
    BINARY: 'binary',
    FORMULA: 'formula',
};
export const CONDITION_FIELD_TYPES = {
    DIRECT: 'direct',
    FORMULA: 'formula',
};

const ERROR_FETCH_DATASET = 'error_fetch_dataset';
const ERROR_SAVE_DATASET = 'error_save_dataset';
const ERROR_VALIDATE_DATASET = 'error_dataset_validation';

export const TOASTERS_NAMES = {
    ERROR_FETCH_DATASET,
    ERROR_SAVE_DATASET,
    ERROR_VALIDATE_DATASET,
};

export const THEME = {
    LIGHT: 'light',
    DARK: 'dark',
};

export const VIEW_PREVIEW = {
    FULL: 'full',
    BOTTOM: 'bottom',
    RIGHT: 'right',
};

export const AGGREGATION_NONE = 'none';
export const AGGREGATION_AUTO = 'auto';

export const SUBSELECT_SOURCE_TYPES = [
    'CH_SUBSELECT',
    'PG_SUBSELECT',
    'MYSQL_SUBSELECT',
    'MSSQL_SUBSELECT',
    'ORACLE_SUBSELECT',
    'CHYT_TABLE',
    'CHYT_TABLE_LIST',
    'CHYT_TABLE_RANGE',
    'CHYT_SUBSELECT',
    'CHYDB_SUBSELECT',
    'YDB_SUBSELECT',
    'YQ_SUBSELECT',
];

export const DATASETS_EDIT_HISTORY_UNIT_ID = 'datsets';

/** This timeout uses for batching operations to decrease validation invocations count */
export const DATASET_VALIDATION_TIMEOUT = 2000;
