import type {AttachmentValue} from 'ui/components/DialogSharedEntryBindings/constants';

export const mock = {
    items: [
        {
            entity: 'entry' as const,
            collectionTitle: 'Collection Title',
            entryId: 'string',
            workbookId: 'string',
            collectionId: 'string',
            scope: 'dataset',
            type: '',
            displayKey: '/ Dataset title',
            key: '/ Dataset title',
            isDelegated: true,
        },
        {
            entity: 'entry' as const,
            collectionTitle: 'Collection Title',
            entryId: 'string',
            workbookId: 'string',
            collectionId: 'string',
            scope: 'connection',
            type: 'mysql',
            displayKey: '/ Connection title',
            key: '/ connection title',
            isDelegated: true,
        },
        {
            entity: 'workbook' as const,
            collectionTitle:
                'CollectionCollection CollectionCollectionCollectionCollectionCollectionCollectionCollection',
            title: 'Workbook testWorkbook testWorkbook testWorkbook testWorkbook testWorkbook testWorkbook testWorkbook testWorkbook testWorkbook testWorkbook testWorkbook testWorkbook testWorkbook test',
            workbookId: 'string',
            collectionId: 'string',
            isDelegated: false,
        },
    ],
};

export const getEntityBindings = (
    _: string,
    __: AttachmentValue,
    ___: string,
): Promise<typeof mock> => {
    return new Promise((resolve) => setTimeout(() => resolve(mock), 200));
};
