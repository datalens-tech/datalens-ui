export const CollectionActionsQa = {
    CreateActionBtn: 'coll-actions-create-btn',
    CreateWorkbookMenuItem: 'coll-actions-create-workbook-menu-item',
    SharedObjectsMenuItem: 'coll-actions-shared-objects-menu-item',
    SharedConnectionCreateBtn: 'coll-actions-shared-conn-create-btn',
    SharedDatasetCreateBtn: 'coll-actions-shared-dataset-create-btn',
} as const;

export const CollectionTableRowQa = {
    CollectionRowDropdownMenuBtn: 'coll-content-table-dropdown-menu-btn',
    CollectionDropdownMenuDeleteBtn: 'coll-content-table-dropdown-menu-delete-btn',
} as const;

export const enum CollectionContentTableQa {
    Table = 'coll-content-table',
    CollectionLinkRow = 'coll-content-table-coll-link-row',
    WorkbookLinkRow = 'coll-content-table-workbook-link-row',
    EntryLinkRow = 'coll-content-table-entry-link-row',
    CollectionTitleCell = 'coll-content-table-coll-title-cell',
}

export const enum DialogCollectionStructureQa {
    ApplyButton = 'coll-structure-dialog-apply-button',
    ListItem = 'coll-structure-dialog-list-item',
}
