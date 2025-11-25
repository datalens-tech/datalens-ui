import z from 'zod';

import {EntryScope} from '../../../..';
import {permissionsSchema} from '../../../../zod-schemas/permissions';
import {sharedEntryPermissionsSchema} from '../../../../zod-schemas/shared-entry-permissions';
import {createTypedAction} from '../../../gateway-utils';

const GET_ENTRIES_RELATIONS_LINK_DIRECTION = {
    FROM: 'from',
    TO: 'to',
} as const;

const getEntriesRelationsArgsSchema = z.strictObject({
    entryIds: z.array(z.string()),
    linkDirection: z.enum(GET_ENTRIES_RELATIONS_LINK_DIRECTION).optional(),
    includePermissionsInfo: z.boolean().optional(),
    limit: z.number().optional(),
    pageToken: z.string().optional(),
    scope: z.enum(EntryScope).optional(),
});

const entryRelationSchema = z.object({
    entryId: z.string(),
    key: z.string().nullable(),
    scope: z.enum(EntryScope),
    type: z.string(),
    createdAt: z.string(),
    public: z.boolean(),
    tenantId: z.string().nullable(),
    workbookId: z.string().nullable(),
    collectionId: z.string().nullable(),
    isLocked: z.boolean().optional(),
    permissions: permissionsSchema.optional(),
    fullPermissions: sharedEntryPermissionsSchema.optional(),
});

const getEntriesRelationsResultSchema = z.object({
    relations: z.array(entryRelationSchema),
    nextPageToken: z.string().optional(),
});

export const getEntriesRelations = createTypedAction(
    {
        paramsSchema: getEntriesRelationsArgsSchema,
        resultSchema: getEntriesRelationsResultSchema,
    },
    {
        method: 'POST',
        path: () => '/v1/get-entries-relations',
        params: (params, headers) => ({body: params, headers}),
    },
);
