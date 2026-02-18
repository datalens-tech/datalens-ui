export enum AvatarQA {
    DeleteButton = 'ds-avatar-delete-button',
    RelationsMapContainer = 'ds-avatar-relations-map-container',
    RelationsMapCanvas = 'ds-avatar-relations-map-canvas',
    Avatar = 'ds-avatar',
}

export enum ParametersQA {
    ParametersTabSection = 'parameters-tab-section',
}

export const FiltersQA = {
    FiltersTabSection: 'filters-tab-section',
    TableDeleteRowBtn: 'filters-table-delete-row-button',
} as const;

export const RelationsMapQA = {
    RelationsMap: 'ds-relations-map',
} as const;

export enum DatasetFieldsTabQa {
    DatasetEditor = 'ds-editor',
    TableRow = 'dataset-fields-table-row',
    FieldNameColumnInput = 'dataset-fields-name-column-input',
    FieldIndexColumnCheckbox = 'dataset-fields-index-column-checkbox',
    FieldIndexHeaderColumnCheckbox = 'dataset-fields-index-header-column-checkbox',
    FieldIdColumnInput = 'dataset-fields-id-column-input',
    FieldDescriptionColumnInput = 'dataset-fields-description-column-input',
    FieldSourceColumnBtn = 'dataset-fields-source-column-btn',
    FieldSettingsColumnIcon = 'dataset-fields-settings-column-icon',
    FieldVisibleColumnIcon = 'dataset-fields-visible-column-icon',
    FieldTypeColumnBtn = 'dataset-fields-type-column-btn',
    FieldAggregationColumnBtn = 'dataset-fields-aggregation-column-btn',
    FieldTypeColumnItem = 'dataset-fields-type-column-item',
    FieldContextMenuBtn = 'dataset-fields-context-menu-btn',
    FieldContextMenuPopup = 'dataset-fields-context-menu-popup',
    TableSettingsBtn = 'dataset-editor-table-settings-btn',
    BatchActionsPanel = 'dataset-editor-actions-panel',
}

export const DatasetFieldTabBatchPanelQa = {
    BatchDelete: 'ds-fields-batch-delete',
    BatchHide: 'ds-fields-batch-hide',
    BatchShow: 'ds-fields-batch-show',
    BatchType: 'ds-fields-batch-type',
    BatchAggregation: 'ds-fields-batch-aggregation',
} as const;

export const DatasetFieldContextMenuItemsQA = {
    DUPLICATE: 'ds-field-context-menu-duplicate',
    EDIT: 'ds-field-context-menu-edit',
    RLS: 'ds-field-context-menu-rls',
    COPY_GUID: 'ds-field-context-menu-copy-guid',
    REMOVE: 'ds-field-context-menu-remove',
    INSPECT: 'ds-field-context-menu-inspect',
} as const;

export const DatasetEditorTableSettingsItems = {
    ShowHidden: 'ds-table-settings-menu-show-hidden',
    ShowId: 'ds-table-settings-menu-show-id',
} as const;

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
    SourcesAddItemBtn: 'ds-source-add-item-button',
} as const;

export enum DatasetPreviewQA {
    Preview = 'dataset-preview',
    RowCountInput = 'ds-preview-header-row-count-input',
    ClosePreviewBtn = 'ds-preview-header-close-btn',
}

export const DatasetSourceEditorDialogQA = {
    Dialog: 'source-editor-dialog',
    EditTitleInput: 'source-editor-title',
    EditPathInput: 'source-editor-path',
    SourceEditorSwitch: 'datasets-source-switcher',
    ApplyBtn: 'source-editor-apply',
    CancelBtn: 'source-editor-cancel',
} as const;
