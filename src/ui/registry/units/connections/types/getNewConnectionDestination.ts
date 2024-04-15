/** A function that determines whether an entity is created in a folder or in a workbook. */
export type GetNewConnectionDestination = (
    hasWorkbookIdInParams?: boolean,
) => 'folder' | 'workbook';
