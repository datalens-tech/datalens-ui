import type {
    GetStructureItemsMode,
    OrderBasicField,
    OrderDirection,
} from '../../../../shared/schema';

export const PAGE_SIZE = 50;

export const DEFAULT_FILTERS: {
    filterString?: string;
    orderField: OrderBasicField;
    orderDirection: OrderDirection;
    mode: GetStructureItemsMode;
    onlyMy: boolean;
} = {
    filterString: undefined,
    orderField: 'createdAt',
    orderDirection: 'desc',
    mode: 'all',
    onlyMy: false,
};

export enum EmptyPlaceholderActionId {
    ConnectYourData = 'connectYourData',
}

export const PUBLIC_GALLERY_ID_SEARCH_PARAM = '_public_gallery_id';

// TODO texts in CHARTS-11999
export const mockSharedEntriesTexts = {
    'label-attachment-source': 'Содержит подключения',
    'label-attachment-target': 'Используется в воркбуках',
    'label-current-entry': 'Выбранный объект',
    'title-bindings-dialog': 'Управление привязками',
    'entries-list-title-workbook': 'Воркбуки',
    'entries-list-title-source': 'Подключения',
    'entries-list-search-placeholder': 'Название',
    'bindings-dialog-error': 'Произошла ошибка',
    'bindings-dialog-retry-btn': 'Попробовать снова',
    'collection-actions-menu-item': 'Общие объекты',
    'collection-actions-menu-notice': 'Объекты для переиспользования и подключения в воркбуки',
    'label-shared-connection': 'Подключение',
    'label-shared-dataset': 'Датасет',
    'collection-structure-dialog-caption': 'Выберите коллекцию для создания',
    'shared-bindings-list-title': 'Привязанные объекты',
    'shared-bindings-list-empty': 'Биндинги отсутствуют',
    'shared-bindings-list-action-unbind': 'Отвязать',
    'shared-bindings-list-action-change-permissions': 'Поменять права',
    'entity-row-relation-tooltip-text': 'Перейти к связанным объектам в воркбуке',
    'entity-row-delegated': 'Права делегированы',
    'entity-row-not-delegated': 'Без делегации прав',
};
