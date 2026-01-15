export const CollectionActionsQa = {
    CreateActionBtn: 'coll-actions-create-btn',
    SharedObjectsMenuItem: 'coll-actions-shared-objects-menu-item',
    SharedConnectionCreateBtn: 'coll-actions-shared-conn-create-btn',
    SharedDatasetCreateBtn: 'coll-actions-shared-dataset-create-btn',
} as const;

export const CollectionTableRowQa = {
    EntryDropdownBtn: 'coll-content-table-entry-dropdown-btn',
    EntryDropdownDeleteBtn: 'coll-content-table-entry-dropdown-delete-btn',
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
