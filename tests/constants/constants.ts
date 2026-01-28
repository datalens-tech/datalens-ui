export const WorkbookIds = {
    E2EWorkbook: '3h42l91yd2lgs',
};

export const WorkbooksUrls = {
    E2EWorkbook: `/workbooks/${WorkbookIds.E2EWorkbook}`,
};

export const CollectionIds = {
    E2ECollection: 'm45slvqc2k9q9',
    E2ESharedEntriesCollection: 'yn9zyftbku4gi',
};

export const CollectionsUrls = {
    E2ECollection: `/collections/${CollectionIds.E2ECollection}`,
    E2ESharedEntriesCollection: `/collections/${CollectionIds.E2ESharedEntriesCollection}`,
};

export const SharedEntryIds = {
    connection: '0qouuqzxk3ick',
    dataset: 'c2069elywgg4w',
} as const;

export const SharedEntryNames = {
    connection: 'Shared connection for workbook test',
    dataset: 'Shared dataset for workbook test',
};

export const URL_QUERY = {
    BINDED_WORKBOOK: 'bindedWorkbookId',
    BINDED_DATASET_WOKRBOOK_ID: 'bindedDatasetWorkbookId',
    BINDED_DATASET: 'bindedDatasetId',
};
