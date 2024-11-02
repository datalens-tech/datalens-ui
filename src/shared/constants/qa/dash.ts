export const enum DashboardAddWidgetQa {
    AddWidget = 'add-widget-button',
    AddControl = 'add-control-button',
    AddGroupControl = 'add-group-control',
    AddText = 'add-text-button',
    AddTitle = 'add-title-button',
    AddImage = 'add-image-button',
}

export const enum DashKitOverlayMenuQa {
    RemoveButton = 'dashkit-overlay-control-dl-remove-button',
    CopyButton = 'dashkit-overlay-control-dl-copy-button',
    PinButton = 'dashkit-overlay-control-dl-pin-button',
    UnpinButton = 'dashkit-overlay-control-dl-unpin-button',
}

export const enum DashboardActionPanelControlsQa {
    SettingsButton = 'dashboard-action-panel-settings-button',
}

export const enum DashboardDialogSettingsQa {
    DialogRoot = 'dashboard-dialog-settings-root',
    ApplyButton = 'dashboard-dialog-settings-apply-button',
    CancelButton = 'dashboard-dialog-settings-cancel-button',
    TOCSwitch = 'settings-dialog-switch-toc',
}

export const enum DashboardDialogControl {
    AcceptableValues = 'acceptable-dialog-values-',
}

export enum DashLoadPrioritySettings {
    charts = 'charts',
    selectors = 'selectors',
}

export enum DashRevisions {
    EXPANDABLE_PANEL = 'expandable-panel',
    EXPANDABLE_PANEL_COLLAPSED_BTN = 'expandable-panel-toggle-btn-collapsed',
    EXPANDABLE_PANEL_EXPANDED_BTN = 'expandable-panel-toggle-btn-expanded',
    EXPANDABLE_PANEL_CLOSE = 'expandable-panel-close',
}

export enum DashEntryQa {
    EntryName = 'dash-entry-name',
    TableOfContent = 'table-of-content',
}

export enum TableOfContentQa {
    TableOfContent = 'table-of-content',
    CloseBtn = 'table-of-content-close',
    MobileTableOfContent = 'mobile-table-of-content',
}

export enum DashMetaQa {
    Dialog = 'dialog-dash-meta',
    SaveButton = 'dash-meta-save-button',
    EditButton = 'dash-meta-edit-button',
}

export enum DashCommonQa {
    RelationTypeButton = 'relation-type-btn',
    AliasSelectLeft = 'alias-first-select',
    AliasSelectRight = 'alias-second-select',
    AliasAddBtn = 'alias-add-new-btn',
    AliasAddApplyBtn = 'alias-add-new-apply-btn',
    AliasesCancelBtn = 'aliases-dialog-cancel-btn',
    AliasShowBtn = 'alias-show-btn',
    AliasesListCollapse = 'aliases-list-collapse-btn',
    AliasRemoveBtn = 'alias-remove-btn',
    AliasItem = 'alias-row-item',
    RelationsApplyBtn = 'relations-apply-btn',
    RelationsCancelBtn = 'relations-cancel-btn',
    WidgetShowTitleCheckbox = 'dialog-widget-settings-show-title',
    WidgetEnableAutoHeightCheckbox = 'dialog-widget-settings-enable-autoheight',
    WidgetEnableBackgroundCheckbox = 'dialog-widget-settings-enable-background',
    WidgetSelectBackgroundButton = 'dialog-widget-settings-select-background-button',
    WidgetSelectBackgroundPalleteContainer = 'dialog-widget-settings-select-background-pallete-container',
    RelationsDialogEmptyText = 'dialog-relations-empty-text',
    RelationsDisconnectAllSwitcher = 'dialog-relations-disconnect-all-switcher',
    RelationsDisconnectAllSelectors = 'dialog-relations-disconnect-all-selectors',
    RelationsDisconnectAllWidgets = 'dialog-relations-disconnect-all-widgets',
    RelationsDisconnectAllCharts = 'dialog-relations-disconnect-all-charts',
    RelationsListRow = 'dialog-relations-list-row',
    RelationsRowPopover = 'dialog-relations-row-popover',
}

export enum DashRelationTypes {
    output = 'relation-type-option-output',
    input = 'relation-type-option-input',
    ignore = 'relation-type-option-ignore',
    both = 'relation-type-option-both',
    unknown = 'relation-type-option-unknown',
}

export enum DashkitQa {
    GRID_ITEM = 'dashkit-grid-item',
}

export enum DashBodyQa {
    App = 'dash-app',
    ContentWrapper = 'dash-body-content-wrapper',
}

export enum FixedHeaderQa {
    Container = 'dash-fixed-header-containter',
    Controls = 'dash-fixed-header-controls',
}

export enum DashTabsQA {
    Root = 'dash-tabs',
}
