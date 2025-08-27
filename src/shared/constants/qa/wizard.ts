export const enum WizardPageQa {
    SectionPreview = 'preview-chartkit',
    VisualizationSelectPopup = 'visualization-select-popup',
    UndoButton = 'undo-btn',
    RedoButton = 'redo-btn',
    PlaceholderIconTooltipContent = 'placeholder-icon-tooltip-content',
}

export const enum SectionDatasetQA {
    DatasetContainer = 'datasets-container',
    DatasetEmptyMessage = 'datasets-blank',
    DatasetSelect = 'dataset-select',
    DatasetFields = 'dataset-fields',
    AddField = 'add-param',
    SectionParameters = 'section-parameters',
    ItemIcon = 'item-icon',
    ItemTitle = 'section-dataset-draggable-item-title',
    ItemFunction = 'section-dataset-item-function',
    AddDatasetButton = 'add-dataset-button',
    CreateFieldButton = 'create-field-button',
    CreateHierarchyButton = 'create-hierarchy-button',
    CreateParameterButton = 'create-parameter-button',
    GoToDatasetButton = 'go-to-dataset-action-button',
    ReplaceDatasetButton = 'replace-dataset-action-button',
    RemoveDatasetButton = 'remove-dataset-action-button',
    SettingsDatasetButton = 'settings-dataset-action-button',
    DatasetSelectMoreMenu = 'dataset-select-more-menu',
    RequestDatasetAccess = 'request-rights-button',
    DatasetSelectMore = 'dataset-select-more',
    FieldActions = 'field-actions',
}

export const enum DialogColumnSettingsQa {
    ResetButton = 'dialog-column-settings-reset-button',
    Dialog = 'dialog-column-settings',
    ApplyButton = 'dialog-column-settings-apply-button',
    CancelButton = 'dialog-column-settings-cancel-button',
    UnitRadioButtons = 'dialog-column-settings-unit-radio-buttons',
    WidthValueInput = 'dialog-column-settings-width-input',
    PinnedColumnsInput = 'dialog-column-settings-pinned-columns-input',
}

export const enum DialogFieldSettingsQa {
    FieldTitleInput = 'dialog-title-input',
    MarkupTypeRadioButtons = 'dialog-field-markup-type',
}

export const enum DialogFieldBackgroundSettingsQa {
    EnableButton = 'dialog-field-bg-switcher',
    FillTypeButtons = 'dialog-field-bg-fill-type',
    ButtonColorDialog = 'button-color-dialog',
    NullModeRadioButtons = 'null-node-radio-buttons',
}

export const enum DialogFieldBarsSettingsQa {
    EnableButton = 'dialog-field-bars-switcher',
    ColorTypeRadioButtons = 'dialog-field-color-type-radio-buttons',
    EnableLabelsButton = 'dialog-field-bars-label-switcher',
    ColorSelector = 'dialog-field-bars-color-selector',
    PositiveColorSelector = 'dialog-field-bars-positive-color-selector',
    NegativeColorSelector = 'dialog-field-bars-negative-color-selector',
    GradientColorSelector = 'dialog-field-bars-gradient-color-selector',
    MinifiedPaletteSelector = 'dialog-field-minifield-palette-selector',
    ScaleModeRadioButtons = 'dialog-field-scale-mode-radio-buttons',
    ScaleInputsWrapper = 'dialog-field-scale-inputs-wrapper',
    EnableBarsInTotalsButton = 'dialog-field-bars-in-totals-switcher',
}

export const enum DialogFieldMainSectionQa {
    TypeSelector = 'type-selector',
    GroupingSelector = 'grouping-selector',
    LabelModeSelector = 'label-mode-selector',
    AggregationSelector = 'aggregation-selector',
    PrecisionInput = 'precision-input',
    PrefixInput = 'prefix-input',
    PostfixInput = 'postfix-input',
    NumberFormat = 'number-format-radio',
}

export const enum DialogFieldTypeSelectorValuesQa {
    Integer = 'type-selector-integer',
    String = 'type-selector-string',
    Float = 'type-selector-float',
    Boolean = 'type-selector-boolean',
    Date = 'type-selector-date',
    Datetime = 'type-selector-datetime',
    GenericDatetime = 'type-selector-genericdatetime',
}

export const enum DialogFieldAggregationSelectorValuesQa {
    None = 'aggregation-selector-none',
    Countuniqe = 'aggregation-selector-countunique',
    Sum = 'aggregation-selector-sum',
    Avg = 'aggregation-selector-avg',
    Min = 'aggregation-selector-min',
    Max = 'aggregation-selector-max',
}

export const enum DialogFieldGroupingSelectorValuesQa {
    None = 'grouping-selector-none',
    TruncYear = 'grouping-selector-trunc-year',
    TruncQuarter = 'grouping-selector-trunc-quarter',
    TruncMonth = 'grouping-selector-trunc-month',
    TruncWeek = 'grouping-selector-trunc-week',
    TruncDay = 'grouping-selector-trunc-day',
    TruncHour = 'grouping-selector-trunc-hour',
    TruncMinute = 'grouping-selector-trunc-minute',
    TruncSecond = 'grouping-selector-trunc-second',
    PartYear = 'grouping-selector-part-year',
    PartQuarter = 'grouping-selector-part-quarter',
    PartMonth = 'grouping-selector-part-month',
    PartWeek = 'grouping-selector-part-week',
    PartDay = 'grouping-selector-part-day',
    PartDayOfWeek = 'grouping-selector-part-dayofweek',
    PartHour = 'grouping-selector-part-hour',
    PartMinute = 'grouping-selector-part-minute',
    PartSecond = 'grouping-selector-part-second',
}

export const enum DialogFieldLabelModeValuesQa {
    Percent = 'label-mode-selector-percent',
    Absolute = 'label-mode-selector-absolute',
}

export const enum DialogFieldSubTotalsQa {
    SubTotalsSwitch = 'sub-totals-switch',
}

export const enum DialogColorQa {
    PaletteSelect = 'palette-select',
    GradientType = 'color-dialog-gradient-type-radio',
    ApplyButton = 'color-dialog-apply-button',
}

export const enum DialogMetricSettingsQa {
    Dialog = 'metric-settings-dialog',
    CancelButton = 'metric-settings-dialog-cancel',
    CustomColorButton = 'metric-settings-dialog-custom-color-btn',
}

export const enum SectionVisualizationAddItemQa {
    NoFieldsErrorTooltip = 'section-visualisation-no-field-error-tooltip',
    LabelsOverflowErrorTooltip = 'section-visualisation-labels-overflow-error-tooltip',
    ShapesOverflowErrorTooltip = 'section-visualisation-shapes-overflow-error-tooltip',
}

export const enum DialogPlaceholderQa {
    TooltipZeroToMaxScale = 'dialog-placeholder-tooltip-zero-to-max-scale',
    TooltipLogarithmicAxis = 'dialog-placeholder-tooltip-logarithmic-axis',
    AxisFormatMode = 'dialog-placeholder-axis-format-mode',
}

export const enum DatasetItemActionsQa {
    RemoveField = 'dropdown-field-menu-remove',
    RemoveHierarchyField = 'dropdown-field-menu-hierarchy-remove',
    EditHierarchyField = 'dropdown-field-menu-hierarchy-edit',
    DuplicateField = 'dropdown-field-menu-duplicate',
    EditField = 'dropdown-field-menu-edit',
    InspectField = 'dropdown-field-menu-inspect',
}

export const enum DialogLinkQa {
    ApplyButton = 'dialog-link-apply-button',
}

export const enum DialogMultiDatasetQa {
    DialogMultiDatasetRoot = 'dialog-multidataset-root',
    RemoveDatasetButton = 'dialog-multidataset-remove-button',
    ApplyButton = 'dialog-multidataset-apply-button',
}

export const enum PlaceholderActionQa {
    OpenColorDialogIcon = 'placeholder-action-open-color-dialog',
}

export const enum HierarchyEditorQa {
    Dialog = 'hierarchy-editor',
    ApplyButton = 'dialog-apply-button',
}

export const enum VisualizationItemQa {
    FormulaIcon = 'formula-icon',
}

export const enum ChartSaveControlsQA {
    SaveMoreDropdown = 'save-more-dropdown',
    SaveAsEditorScript = 'save-as-editor-script',
}

export const enum ChartSettingsDialogQA {
    IndicatorTitleMode = 'indicator-title-mode',
    PreserveWhiteSpace = 'preserve-white-space',
}
