export enum AvatarQA {
    DeleteButton = 'ds-avatar-delete-button',
    RelationsMapContainer = 'ds-avatar-relations-map-container',
    RelationsMapCanvas = 'ds-avatar-relations-map-canvas',
    Avatar = 'ds-avatar',
}

export enum ParametersQA {
    ParametersTabSection = 'parameters-tab-section',
}

export enum DatasetFieldsTabQa {
    TableRow = 'dataset-fields-table-row',
    FieldNameColumnInput = 'dataset-fields-name-column-input',
    FieldSettingsColumnIcon = 'dataset-fields-settings-column-icon',
}

export enum DatasetFieldSettingsDialogQa {
    Dialog = 'dataset-field-settings-dialog',
    ColorSettingsButton = 'dataset-field-settings-dialog-color-settings-btn',
}

export enum DatasetFieldColorsDialogQa {
    Dialog = 'dataset-field-colors-dialog',
    ValueItem = 'dataset-field-colors-dialog_value-item',
    ValueItemColorIcon = 'dataset-field-colors-dialog_value-color',
    PaleteItem = 'dataset-field-colors-dialog_palette-item',
}

export enum DatasetTabSectionQA {
    AddButton = 'dataset-tab-section-add-button',
    FieldRow = 'dataset-tab-section-field-row',
    FieldRowMenu = 'dataset-tab-field-row-menu',
    FieldRowHeader = 'dataset-tab-section-field-row-header',
    RemoveRow = 'dataset-tab-field-row-remove',
    EditRow = 'dataset-tab-field-row-edit',
    DuplicateRow = 'dataset-tab-field-row-duplicate',
    Copy = 'dataset-tab-field-row-copy',
}

export enum DatasetPanelQA {
    TabRadio = 'dataset-panel-tab-radio',
    UpdateFieldsButton = 'dataset-panel-update-fields-button',
    PreviewButton = 'dataset-panel-preview-button',
}

export enum DatasetSourcesLeftPanelQA {
    ConnSelection = 'dataset-sources-conn-selection',
    ConnContextMenuBtn = 'dataset-sources-conn-context-menu-btn',
    ConnContextMenuOpen = 'dataset-sources-conn-context-menu-open',
    ConnContextMenuReplace = 'dataset-sources-conn-context-menu-replace',
    ConnContextMenuDelete = 'dataset-sources-conn-context-menu-delete',
    SelectSourcesDbName = 'dataset-sources-db-name-select',
    SourcesServerSearchInput = 'dataset-sources-server-search-input',
    SourcesList = 'dataset-sources-list',
    SourcesListRetryButton = 'dataset-sources-list-retry-button',
}

export enum DatasetActionQA {
    CreateButton = 'dataset-create-button',
}

export const enum DatasetDialogRelationQA {
    AddRelation = 'dataset-dialog-relation-add-relation-button',
    Apply = 'dataset-dialog-relation-save-button',
    DialogTitle = 'dataset-dialog-relation-dialog-title',
}

export const DATASET_TAB = {
    DATASET: 'dataset',
    FILTERS: 'filters',
    SOURCES: 'sources',
    PARAMETERS: 'parameters',
} as const;

export const DatasetSourcesTableQa = {
    Source: 'ds-source',
    SourceMenu: 'ds-source-menu',
    SourceContextMenuBtn: 'ds-source-context-menu-btn',
    SourceContextMenuDelete: 'ds-source-context-menu-delete',
    SourceContextMenuModify: 'ds-source-context-menu-modify',
} as const;

export enum DatasetPreviewQA {
    Preview = 'dataset-preview',
}
