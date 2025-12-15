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
    'label-relation-entity': 'Где используется',
    'title-bindings-dialog': 'Управление привязками',
    'title-bindings-dialog-delete': 'Удалить {{entry}}?',
    'apply-bindings-dialog-delete': 'Удалить',
    'alert-title-info-bindings-dialog-delete': '{{entry}} нигде не используется',
    'alert-message-info-bindings-dialog-delete': 'Удаление ничего не сломает',
    'alert-message-info-workbook-dialog-delete':
        'Удаление не повлияет на Wizard-чарты, но может повлиять на Editor-чарты если используется в них',
    'alert-title-warning-bindings-dialog-delete': '{{entry}} используется в некоторых {{relation}}',
    'alert-message-warning-bindings-dialog-delete':
        'Перед удалением убедитесь, что ничего не сломается',
    'alert-message-warning-workbook-dialog-delete':
        'Перед удалением убедитесь, что ничего не сломается. Если у вас есть Editor-чарты, их придется проверить вручную',
    'cancel-bindings-dialog-delete': 'Отмена',
    'relations-bindings-dialog-delete': 'воркбуках и датасетах',
    'relations-workbook-dialog-delete': 'зависимостях',
    'relation-workbook-bindings-dialog-delete': 'воркбуках',
    'relation-dataset-bindings-dialog-delete': 'датасетах',
    'relation-chart-workbook-dialog-delete': 'чартах',
    'relation-dash-workbook-dialog-delete': 'дашбордах',
    'bindings-dialog-delete-refresh-btn': 'Обновить',
    'entries-list-title-workbook': 'Воркбуки',
    'entries-list-title-connection': 'Подключения',
    'entries-list-title-dataset': 'Датасеты',
    'label-of-shared-dataset': 'Датасета',
    'entries-list-search-placeholder': 'Название',
    'bindings-dialog-error': 'Произошла ошибка',
    'bindings-dialog-retry-btn': 'Попробовать снова',
    'collection-actions-menu-item': 'Общие объекты',
    'collection-actions-menu-notice': 'Объекты для переиспользования и подключения в воркбуки',
    'label-shared-connection': 'Подключение',
    'label-shared-dataset': 'Датасет',
    'label-relation-dataset': 'датасете',
    'label-relation-workbook': 'воркбуке',
    'label-workbook': 'Воркбук',
    'collection-structure-dialog-caption': 'Выберите коллекцию для создания',
    'shared-bindings-list-title': 'Привязанные объекты',
    'shared-bindings-list-empty': 'Биндинги отсутствуют',
    'shared-bindings-list-action-unbind': 'Отвязать',
    'shared-bindings-list-action-change-permissions': 'Поменять права',
    'entity-row-relation-tooltip-text': 'Перейти к связанным объектам в воркбуке',
    'entity-row-delegated': 'Права делегированы',
    'entity-row-not-delegated': 'Без делегации прав',
    'cancel-unbind-dialog': 'Отмена',
    'apply-unbind-dialog': 'Отвязать',
    'apply-permissions-dialog': 'Применить',
    'title-permissions-dialog': 'Настройка доступа',
    'delegate-title-permissions-dialog': 'Делегировать права доступа',
    'delegate-message-permissions-dialog':
        'Внутри воркбука права на подключение проверяться не будут',
    'not-delegate-title-permissions-dialog': 'Не делегировать права доступа',
    'not-delegate-message-permissions-dialog':
        'Для просмотра данных необходимо выдать права на оригинал подключения',
    'permissions-dialog-notice':
        'Неправильная настройка может привести к непредвиденным результатам. Подробнее в ',
    'permissions-dialog-documentation-link': 'документации',
    'open-relation-unbind-dialog': 'Открыть {{relation}}',
    'title-alert-unbind-dialog': '{{entry}} используется в {{relation}}',
    'title-unbind-dialog': 'Отвязать {{entry}}?',
    'message-alert-unbind-dialog':
        'Если на данных из {{entry}} построены {{relation}}, они перестанут работать. Убедитесь что все безопасно',
    'message-relation-alert-unbind-dialog': 'чарты',
    'message-relations-alert-unbind-dialog': 'датасеты и чарты',
    'label_filter-by-type-only-entries': 'Только общие объекты',
    'or-select-shared-entry-dialog': 'или',
    'past-link-btn-select-shared-entry-dialog': 'Указать ссылку',
    'title-select-shared-entry-dialog-connection': 'Выберите подключение',
    'title-select-shared-entry-dialog-dataset': 'Выберите датасет',
    'shared-entry-bindings-dropdown-menu-title': 'Управление привязками',
    'shared-entry-delete-dropdown-menu-title': 'Удалить',
    'shared-entry-workbook-table-title': 'Привязанные объекты',
    'add-entry-workbook-toast-title-dataset': 'Датасет привязан к воркбуку',
    'add-entry-workbook-toast-title-connection': 'Подключение привязано к воркбуку',
    'add-entry-workbook-toast-message': 'Название: {{name}}',
    'workbook-navigation-title': '{{entry}} в воркбуке',
    'workbook-navigation-shared-title': 'Привязанные {{entry}}',
    'iam-dialog-role-limitedEntryBindingCreator': 'Делегация прав',
    'iam-dialog-role-entryBindingCreator': 'Без делегации прав',
    'add-shared-connection-from-link-info-message':
        'Подключение и воркбук должны находиться в одной организации и у вас должны быть права на привязку выбранного подключения. Подробнее в ',
    'add-shared-connection-from-link-dialog-title': 'Укажите ссылку на подключение',
    'add-shared-connection-from-link-dialog-input-label': 'Ссылка:',
    'add-shared-connection-from-link-dialog-apply': 'Далее',
    'add-shared-connection-from-link-dialog-error': 'Некорректная ссылка',
    'add-shared-connection-from-link-dialog-required': 'Введите ссылку',
    'add-shared-connection-from-link-dialog-entry-error': 'Невалидная сущность',
    'workbook-shared-entry-original-link': 'Открыть оригинал',
    'dataset-filters-readonly-alert-title': 'Фильтры отсутствуют',
    'dataset-parameters-readonly-alert-title': 'Параметры отсутствуют',
    'dataset-empty-filters-readonly-alert-message':
        'Для добавления фильтров перейдите к оригиналу датасета',
    'dataset-empty-parameters-readonly-alert-message':
        'Для добавления параметров перейдите к оригиналу датасета',
    'dataset-filters-readonly-alert-message':
        'Для редактирования и добавления фильтров перейдите к оригиналу датасета',
    'dataset-parameters-readonly-alert-message':
        'Для редактирования и добавления параметров перейдите к оригиналу датасета',
};
