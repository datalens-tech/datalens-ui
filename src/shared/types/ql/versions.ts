export enum QlConfigVersions {
    V1 = '1',
    // add required queryName field to queries
    V2 = '2',
    // shapes, colors, tooltips and labels are required
    V3 = '3',
    // A new 'dimensions' section has been added to the pie chart, the old section 'dimensions' has been moved to 'colors'.
    V4 = '4',
    // Rename 'default-palette' to classic20
    V5 = '5',
}
