import type {GetEntryResponse} from 'shared/schema/types';

/** A function that creates mocked entry to have properly Breadcrumbs view. */
export type GetFakeEntry = (workbookId?: string, collectionId?: string) => GetEntryResponse;
