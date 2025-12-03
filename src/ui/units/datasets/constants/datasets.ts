import {ENTRY_CONTEXT_MENU_ACTION} from 'ui/components/EntryContextMenu';

import {DL} from '../../../constants';

const preprodEnv = DL.IS_DEVELOPMENT || DL.IS_PREPROD;

export enum QueryParam {
    Action = 'action',
    YtPath = 'ytPath',
}

export enum ActionQueryParam {
    AutoCreate = 'autoCreate',
}

export enum ComponentErrorType {
    AvatarRelation = 'avatar_relation',
    DataSource = 'data_source',
    Field = 'field',
    ObligatoryFilter = 'obligatory_filter',
    SourceAvatar = 'source_avatar',
}

export const mapYTClusterToConnId: Record<string, string> = {
    CHYT_ARNOLD: preprodEnv ? '5hs5qbuagvc2z' : '6in99m5b0dok0',
    CHYT_HAHN: preprodEnv ? '8kv9dgp8bqbs2' : '1di43d901khiv',
    CHYT_KOLMOGOROV: preprodEnv ? 'einpf4xnhfzk0' : 'sw13ogot5wcse',
    CHYT_VANGA: preprodEnv ? 'eq1f0qaiwkaw8' : 'w8dy1hcbwrrcq',
};

export const MANAGED_BY = {
    USER: 'user',
};

export const MIN_AVAILABLE_DATASET_REV_DATE = '2024-12-01T00:00:00.000Z';
export const DATASET_DATE_AVAILABLE_FORMAT = 'DD.MM.YYYY';

export const SharedDatasetHiddenContextMenuItems = new Set<string>([
    ENTRY_CONTEXT_MENU_ACTION.SHOW_RELATED_ENTITIES,
    ENTRY_CONTEXT_MENU_ACTION.DELETE,
    ENTRY_CONTEXT_MENU_ACTION.ACCESS,
    ENTRY_CONTEXT_MENU_ACTION.MOVE,
    ENTRY_CONTEXT_MENU_ACTION.COPY,
    ENTRY_CONTEXT_MENU_ACTION.MIGRATE_TO_WORKBOOK,
]);
