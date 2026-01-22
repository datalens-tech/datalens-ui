import z from 'zod';

import {getEntryNameByKey} from '../../../../modules';
import {createTypedAction} from '../../../gateway-utils';
import type {GetStructureItemsArgs, GetStructureItemsResponse} from '../../../us/types/collections';
import {collectionPermissionsSchema, collectionSchema} from '../../schemas/collections';
import {workbookPermissionsSchema, workbookSchema} from '../../schemas/workbooks';

const getStructureItemsArgsSchema = z.object({
    collectionId: z.string().nullable(),
    page: z.string().nullable().optional(),
    filterString: z.string().optional(),
    orderField: z.enum(['title', 'createdAt', 'updatedAt']).optional(),
    orderDirection: z.enum(['asc', 'desc']).optional(),
    onlyMy: z.boolean().optional(),
    mode: z.enum(['all', 'onlyCollections', 'onlyWorkbooks']).optional(),
    pageSize: z.number().optional(),
    includePermissionsInfo: z.boolean().optional(),
});

export const collectionItemSchema = collectionSchema.extend({
    entity: z.literal('collection'),
    permissions: collectionPermissionsSchema.optional(),
});

export const workbookItemSchema = workbookSchema.extend({
    entity: z.literal('workbook'),
    permissions: workbookPermissionsSchema.optional(),
});

const getStructureItemsResultSchema = z.object({
    items: z.discriminatedUnion('entity', [collectionItemSchema, workbookItemSchema]).array(),
    nextPageToken: z.string().nullable().optional(),
});

export const getStructureItems = createTypedAction<
    GetStructureItemsResponse,
    GetStructureItemsArgs
>(
    {
        paramsSchema: getStructureItemsArgsSchema,
        resultSchema: getStructureItemsResultSchema,
    },
    {
        method: 'GET',
        path: () => '/v1/structure-items',
        params: (
            {
                collectionId,
                includePermissionsInfo,
                filterString,
                page,
                pageSize,
                orderField,
                orderDirection,
                onlyMy,
                mode,
            },
            headers,
        ) => ({
            query: {
                collectionId,
                includePermissionsInfo,
                filterString,
                // null is passed from query parameters
                page: page === null ? 'null' : page,
                pageSize,
                orderField,
                orderDirection,
                onlyMy,
                mode,
            },
            headers,
        }),
        transformResponseData: (data) => ({
            ...data,
            items: data.items.map((item) => {
                if ('displayKey' in item) {
                    return {...item, title: getEntryNameByKey({key: item.displayKey})};
                }
                return item;
            }),
        }),
    },
);
