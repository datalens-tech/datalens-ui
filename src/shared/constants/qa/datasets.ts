export enum AvatarQA {
    DeleteButton = 'ds-avatar-delete-button',
    RelationsMapContainer = 'ds-avatar-relations-map-container',
    RelationsMapCanvas = 'ds-avatar-relations-map-canvas',
}

export enum ParametersQA {
    ParametersTabSection = 'parameters-tab-section',
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
}

export enum DatasetSourcesLeftPanelQA {
    ConnSelection = 'dataset-sources-conn-selection',
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
