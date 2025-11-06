import type {ValueOf} from 'shared';
import type {CreationPlaces} from 'ui/units/connections/constants';

/** A function that determines whether an entity is created in a folder or in a workbook. */
export type GetNewConnectionDestination = (
    hasWorkbookIdInParams?: boolean,
    hasCollectionIdInParams?: boolean,
) => ValueOf<typeof CreationPlaces>;
