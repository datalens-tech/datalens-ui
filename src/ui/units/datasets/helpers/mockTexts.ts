const EarlyInvalidationCacheMockTexts = {
    'dataset-cache-tab-name': 'Проверка кэша',
    'dataset-cache-tab-title': 'Проверка кэша',
    'dataset-cache-tab-description':
        'Проверяйте актуальность данных через поле датасета или SQL-запрос. Мы будем проверять данные при каждом обращении к датасету. Обычно, для этого создают специальное поле с версией датасета, читайте подробнее в',
    'dataset-cache-tab-doc-link': 'документации',
    'dataset-cache-tab-description-ps':
        'Эта настройка работает независимо от по проверке кэша в подключении',
    'dataset-cache-tab-confirm-btn': 'Проверить результат',
    'cache-check-not-work': 'Проверка не работает',
    'cache-check-not-work-message':
        'Текущая формула не отдаёт результат. Попробуйте изменить её или использовать поле',
    'cache-check-not-work-btn': 'Подробнее',
    'cache-value-row-label': 'Проверять кэш',
    'cache-value-disabled': 'Нет',
    'cache-value-formula': 'По формуле',
    'cache-value-sql': 'SQL',
    'last-result-label': 'Последний результат',
    'last-result-error-text': 'Завершился с ошибкой',
    'last-result-error-btn-text': 'Показать ошибку',
    'last-result-btn-text': 'Открыть',
    'last-result-text': 'Получен {{date}} в {{time}}',
    'add-parameter-btn-text': 'Добавить',
    'add-filter-btn-text': 'Добавить',
    'edit-parameter-btn-text': 'Редактировать',
    'formula-row-label': 'Формула',
    'formula-dialog-apply-btn-text': 'Сохранить',
    'sql-row-label': 'SQL-запрос',
    'filter-row-label': 'Фильтрация',
};

export const getEarlyInvalidationCacheMockText = (
    key: keyof typeof EarlyInvalidationCacheMockTexts,
    args?: Record<string, string>,
) => {
    const text = EarlyInvalidationCacheMockTexts[key];
    return text.replace(/\{\{(\w+)\}\}/g, (_, name) => {
        return args?.[name] ?? `{{${name}}}`;
    });
};
