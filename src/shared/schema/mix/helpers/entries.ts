import get from 'lodash/get';

import type {TypedApi} from '../..';
import type {WizardVisualizationId} from '../../../constants';
import {EntryScope, type Shared, type WorkbookId} from '../../../types';
import type {
    CheckConnectionsForPublicationResponse,
    CheckDatasetsForPublicationResponse,
    GetEntryMetaStatusResponse,
} from '../../types';
import type {EntryFields, GetEntriesEntryResponse} from '../../us/types';

export function filterEntirsForCheck(entries: Pick<EntryFields, 'entryId' | 'scope'>[]) {
    const datasetIds: string[] = [];
    const connectionsIds: string[] = [];

    entries.forEach((entry) => {
        if (!('scope' in entry)) {
            throw new Error("Entry should have required field 'scope'");
        }

        if (entry.scope === EntryScope.Dataset) {
            datasetIds.push(entry.entryId);
        } else if (entry.scope === EntryScope.Connection) {
            connectionsIds.push(entry.entryId);
        }
    });
    return {datasetIds, connectionsIds};
}

export function escapeStringForLike(str: string) {
    return str.replace(/[%_]/g, '\\$&');
}

export function getEntryVisualizationType(entry: Partial<EntryFields>) {
    try {
        const sharedData = get(entry, 'data.shared');
        const shared: Shared | null =
            typeof sharedData === 'string' ? JSON.parse(sharedData) : null;
        return shared?.visualization?.id as WizardVisualizationId | undefined;
    } catch (e) {
        return undefined;
    }
}

export function getEntryHierarchy(entry: Partial<EntryFields>) {
    try {
        const sharedData = get(entry, 'data.shared');
        const shared: Shared | null =
            typeof sharedData === 'string' ? JSON.parse(sharedData) : null;
        return shared?.hierarchies;
    } catch (e) {
        return undefined;
    }
}

export const checkEntriesForPublication = async ({
    entries,
    typedApi,
    workbookId,
}: {
    entries: Pick<EntryFields, 'entryId' | 'scope'>[];
    typedApi: TypedApi;
    workbookId: WorkbookId;
}) => {
    const {datasetIds} = filterEntirsForCheck(entries);
    const promises: [
        Promise<CheckDatasetsForPublicationResponse> | null,
        Promise<CheckConnectionsForPublicationResponse> | null,
    ] = [null, null];

    if (datasetIds.length) {
        promises[0] = typedApi.bi.checkDatasetsForPublication({
            datasetsIds: datasetIds,
            workbookId,
        });
    }
    // if (connectionsIds.length) {
    //     promises[1] = typedApi.bi.checkConnectionsForPublication({
    //         connectionsIds: connectionsIds,
    //         workbookId,
    //     });
    // }

    return Promise.all(promises);
};

export function getEntryMetaStatusByError(errorWrapper: unknown): GetEntryMetaStatusResponse {
    let error;
    if (errorWrapper instanceof Object && 'error' in errorWrapper) {
        error = errorWrapper.error;
    }
    if (typeof error === 'object' && error !== null && 'status' in error) {
        switch (error.status) {
            case 400:
                // us ajv validation
                if ('code' in error && error.code === 'DECODE_ID_FAILED') {
                    return {code: 'NOT_FOUND'};
                }
                // us zod validation
                if ('code' in error && error.code === 'VALIDATION_ERROR') {
                    const path = get(error, ['details', 'details', 0, 'path', 0]);
                    if (path === 'entryId') {
                        return {code: 'NOT_FOUND'};
                    }
                }
                return {code: 'UNHANDLED'};
            case 403:
                return {code: 'FORBIDDEN'};
            case 404:
                return {code: 'NOT_FOUND'};
            default:
                return {code: 'UNHANDLED'};
        }
    } else {
        return {code: 'UNHANDLED'};
    }
}

export async function collectAllRelatedEntryIds({
    entryId,
    typedApi,
    ctx,
}: {
    entryId: string;
    typedApi: TypedApi;
    ctx?: {logError: (message: string, error: Error) => void};
}): Promise<Set<string>> {
    const allRelatedEntryIds = new Set<string>();
    const visited = new Set<string>();

    async function collectRelations(currentEntryId: string): Promise<void> {
        if (visited.has(currentEntryId)) {
            return;
        }
        visited.add(currentEntryId);

        try {
            const relations = await typedApi.us.getRelations({
                entryId: currentEntryId,
                direction: 'parent',
            });

            for (const relation of relations) {
                allRelatedEntryIds.add(relation.entryId);
                await collectRelations(relation.entryId);
            }
        } catch (error) {
            ctx?.logError(`Error getting relations for entry ${currentEntryId}`, error as Error);
        }
    }

    await collectRelations(entryId);

    return allRelatedEntryIds;
}

export async function fetchEntriesWithLinks({
    entryIds,
    typedApi,
    ctx,
}: {
    entryIds: string[];
    typedApi: TypedApi;
    ctx?: {logError: (message: string, error: Error) => void};
}): Promise<(GetEntriesEntryResponse | null)[]> {
    if (entryIds.length === 0) {
        return [];
    }

    const results: (GetEntriesEntryResponse | null)[] = [];

    // Process in batches of 50 to avoid URL length limitations
    for (let i = 0; i < entryIds.length; i += 50) {
        const batchIds = entryIds.slice(i, i + 50);

        try {
            const entriesResult = await typedApi.us.getEntries({
                ids: batchIds,
                includeLinks: true,
            });

            // Create map for quick lookup
            const entriesMap = new Map(
                entriesResult.entries.map((entry) => [entry.entryId, entry]),
            );

            // Preserve order from batchIds
            batchIds.forEach((id) => {
                const entry = entriesMap.get(id);
                results.push(entry || null);
            });
        } catch (error) {
            ctx?.logError(`Error fetching entries batch (${batchIds.length} IDs)`, error as Error);
            results.push(...new Array(batchIds.length).fill(null));
        }
    }

    return results;
}

export function buildEnrichedLinksTree({
    entriesData,
    annotations,
}: {
    entriesData: (GetEntriesEntryResponse | null)[];
    annotations?: Array<{
        entryId: string;
        result?: {
            scope?: EntryScope;
            type?: string;
            annotation?: {
                description?: string;
            };
        };
        error?: {
            code?: string;
            message?: string;
            details?: unknown;
        };
    }>;
}) {
    const linksTree: Record<string, {description?: string; links: Record<string, any>}> = {};

    // Build basic tree structure
    for (const entry of entriesData) {
        if (!entry) continue;

        linksTree[entry.entryId] = {
            links: {},
        };

        if ('links' in entry && entry.links) {
            for (const [_linkId, linkEntryId] of Object.entries(entry.links)) {
                if (typeof linkEntryId === 'string') {
                    linksTree[entry.entryId].links[linkEntryId] = {
                        entryId: linkEntryId,
                        links: {},
                    };
                }
            }
        }
    }

    // Enrich with annotations if provided
    if (annotations) {
        const annotationsMap = new Map(
            annotations
                .filter(
                    (ann): ann is typeof ann & {result: NonNullable<typeof ann.result>} =>
                        'result' in ann && Boolean(ann.result),
                )
                .map((ann) => [ann.entryId, ann.result.annotation?.description]),
        );

        for (const [currentEntryId, node] of Object.entries(linksTree)) {
            const description = annotationsMap.get(currentEntryId);
            if (description) {
                node.description = description;
            }

            for (const [linkId, linkNode] of Object.entries(node.links)) {
                const linkDescription = annotationsMap.get(linkId);
                if (linkDescription) {
                    linkNode.description = linkDescription;
                }
            }
        }
    }

    return linksTree;
}
