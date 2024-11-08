export enum ActionPanelQA {
    MoreBtn = 'entry-panel-more-btn',
    ActionPanel = 'entry-action-panel',
    EntryMenuTop = 'entry-menu-top',
    EntryMenuTopRevisions = 'entry-menu-top-revisions',
}

export enum SaveChartControlsQa {
    SaveButton = 'action-panel-save-btn',
}

export enum DialogParameterQA {
    Apply = 'dialog_parameter-apply-btn',
    Cancel = 'dialog_parameter-cancel-btn',
    Reset = 'dialog_parameter-reset-btn',
    DefaultValueInput = 'dialog_parameter-default-value-input',
    NameInput = 'dialog_parameter-name-input',
    TypeSelector = 'dialog_parameter-type_selector',
    Dialog = 'dialog-parameter',
}

export enum ConnectionsDialogQA {
    Apply = 'connections-dialog-apply-button',
    Cancel = 'connections-dialog-cancel-button',
    Content = 'connections-dialog-content',
    EmptyContent = 'connections-dialog-content-empty',
    ElementSelect = 'connections-dialog-element-select',
    ElementSelectItems = 'connections-dialog-element-select-items',
    TypeSelect = 'connections-dialog-type-select',
    TypeSelectItems = 'connections-dialog-type-select-items',
    TypeSelectConnectedOption = 'connections-dialog-type-select-connected-option',
    TypeSelectInputOption = 'connections-dialog-type-select-input-option',
    TypeSelectOutputOption = 'connections-dialog-type-select-output-option',
    TypeSelectIgnoreOption = 'connections-dialog-type-select-ignore-option',
}

export enum AddFieldQA {
    Option = 'add-field-option',
    AddFieldButton = 'add-field-button',
    MeasureFieldIcon = 'add-measure-field-icon',
    DimensionsFieldIcon = 'add-dimension-field-icon',
}

export enum DialogTabsQA {
    Dialog = 'dialog-tabs',
    PopupWidgetOrder = 'popup-widget-order',
    PopupWidgetOrderList = 'popup-widget-order-list',
    TabItemMenu = 'tab-item-menu',
    TabItemMenuOrder = 'tab-item-menu-order',
    RowAdd = 'dialog-tabs-row-add',
    Save = 'dialog-tabs-save-button',
    Cancel = 'dialog-tabs-cancel-button',
    EditTabItem = 'edit-tab-input',
    ReadOnlyTabItem = 'read-only-tab-item',
}

export enum EntryDialogQA {
    Apply = 'entry-dialog-apply-button',
    Cancel = 'entry-dialog-cancel-button',
    Reset = 'entry-dialog-reset-button',
    FolderSelect = 'entry-dialog-select',
    Content = 'entry-dialog-content',
    PathSelect = 'path-select',
}

export enum MenuItemsQA {
    EXPORT = 'export',
    EXPORT_CSV = 'exportCsv',
    EXPORT_MARKDOWN = 'exportMarkdown',
    EXPORT_SCREENSHOT = 'exportScreenshot',
    INSPECTOR = 'inspector',
    NEW_WINDOW = 'openInNewWindow',
    GET_LINK = 'getLink',
    ALERTS = 'alerts',
}

export enum ParamsSettingsQA {
    Settings = 'params-settings',
    Open = 'params-settings-open-btn',
    Add = 'params-settings-add-btn',
    Remove = 'params-settings-remove-btn',
    RemoveAll = 'params-settings-remove-all-btn',
    ParamRow = 'params-settings-param-row',
    ParamTitle = 'params-settings-param-title',
    ParamValue = 'params-settings-param-value',
    ParamAddValue = 'params-settings-param-add-value-btn',
}

export enum NavigationInputQA {
    Apply = 'navigation-input-ok-button',
    Input = 'navigation-input',
    Link = 'navigation-input-use-link-button',
    Open = 'navigation-input-open-button',
}

export enum TabMenuQA {
    List = 'tab-menu-list',
    Item = 'tab-menu-list-item',
    ItemRemove = 'tab-menu-list-item-remove',
    Add = 'tab-menu-add',
    Paste = 'tab-menu-paste',
}

export enum DialogConfirmQA {
    Dialog = 'dialog-confirm',
    ApplyButton = 'dialog-confirm-apply-button',
    CancelButton = 'dialog-confirm-cancel-button',
}

export enum DialogWarningQA {
    Dialog = 'dialog-warning',
    ApplyButton = 'dialog-warning-apply-button',
}

export enum DialogDraftWarningQA {
    Dialog = 'dialog-draft-warning',
    EditButton = 'dialog-draft-warning-edit-btn',
}

export enum DialogDashWidgetItemQA {
    Text = 'dialog_widget-text',
    Title = 'dialog_widget-title',
    Image = 'dialog_widget-image',
}

export enum DialogDashTitleQA {
    Input = 'dialog-dash-title-input',
}

export enum DialogDashWidgetQA {
    Apply = 'dialog_widget-apply-btn',
    Cancel = 'dialog_widget-cancel-btn',
}

export const enum DialogFieldEditorQA {
    ApplyButton = 'dialog-field-editor-apply-button',
    CancelButton = 'dialog-field-editor-cancel-button',
}

export const enum NavigationMinimalPlaceSelectQa {
    Connections = 'navigation-minimal-place-connections',
    Datasets = 'navigation-minimal-place-datasets',
}

export const enum RelativeDatepickerQa {
    ScaleSelectStart = 'scale-select-start',
    ScaleSelectEnd = 'scale-select-end',
}

export const enum WorkbookNavigationMinimalQa {
    Popup = 'workbook-navigation-minimal-popup',
    Input = 'workbook-navigation-minimal-input',
    List = 'workbook-navigation-minimal-list',
}

export const enum DialogCreateWorkbookEntryQa {
    Root = 'dialog-create-workbook-entry-root',
    Input = 'dialog-create-workbook-entry-input',
    ApplyButton = 'dialog-create-workbook-entry-apply-button',
}

export const enum CreateEntityButton {
    Button = 'create-entry-button',
    Popup = 'create-entry-button-popup',
}

export enum DocSectionQa {
    Group = 'doc-section-group',
    Item = 'doc-section-item',
    Title = 'doc-item-title',
}

export enum PreviewQa {
    ChartWrapper = 'preview-chart-wrapper',
}

export enum DatalensTabs {
    MobileItem = 'dash-mobile-tab-item',
    Item = 'dash-tab-item',
    SwitcherItem = 'dash-tab-switcher-item',
}

export enum DatalensHeaderQa {
    DesktopContainer = 'datalens-header-desktop-container',
    MobileContainer = 'datalens-header-mobile-container',
}
