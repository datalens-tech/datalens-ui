export enum ChartsConfigVersion {
    // Initial version
    V1 = '1',
    // The dataset and datasets fields have been removed from the config. Instead, only partial knowledge about the dataset has been added.
    // New datasetsIds, datasetsPartialFields fields are now saved in the config.
    // Based on them, we prepare Wizard widget and data in urls
    // datasetsIds: string[]; datasetsPartialFields: ChartsConfigDatasetField[][]
    V2 = '2',
    // The sort field for geo visualizations should be stored in commonPlaceholders, not just in the chart config.
    V3 = '3',
    // Moved the labelMode fields from the top level of the field to formatting.labelMode
    V4 = '4',
    // Added axisMode to placeholder settings
    // Removed dateMode from Date|Datetime|GenericDatetime type fields
    V5 = '5',
    // Measure Names fields were deleted from sort placeholder for pivot tables charts.
    V6 = '6',
    // axisMode replaced to object where keys are guids of fields and values are 'continuous' | 'discrete'
    V7 = '7',
    // move totals setting from chart settings to field settings for pivot table chart.
    V8 = '8',
    // shapes in the scatter chart are specified by field in shape section
    V9 = '9',
    // A new 'dimensions' section has been added to the pie chart, the old section 'dimensions' has been moved to 'colors'.
    V10 = '10',
    // Added new field for displaying the title in the indicator charts.
    V11 = '11',
    // isMarkdown boolean field is converted to a string markupType.
    V12 = '12',
    // rename 'default-palette' value to classic20
    V13 = '13',
    // rename the palette id (remove the word "palette" from the value)
    V14 = '14',
}
