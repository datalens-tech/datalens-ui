import {parse} from 'querystring';

import {AppError} from '@gravity-ui/nodekit';

import type {StringParams} from '../../shared';
import type {
    GetEntryByKeyResponse,
    GetEntryMetaResponse,
    ResolveEntryByLinkComponentArgs,
    ResolveEntryByLinkComponentResponse,
} from '../../shared/schema';
import {registry} from '../registry';

export enum ErrorCode {
    IncorrectURL = 'INCORRECT_URL',
    NotFound = 'NOT_FOUND',
    Forbidden = 'FORBIDDEN',
    Unknown = 'UNKNOWN',
}

// eslint-disable-next-line complexity
async function resolveEntryByLink({
    originalUrl,
    ctx,
    getEntryMeta,
}: ResolveEntryByLinkComponentArgs): Promise<ResolveEntryByLinkComponentResponse> {
    try {
        const url = new URL(originalUrl, 'http://stub');

        const idOrKeyOrReport =
            url.pathname
                .replace(/^\/navigation\//, '')
                .replace(/^\/navigate\//, '')
                .replace(/^\/wizard\/preview\//, '')
                .replace(
                    /^(\/(ChartPreview|preview))?(\/(ChartWizard|wizard|ChartEditor|editor))?\/?/,
                    '',
                ) || url.searchParams.get('name');

        if (!idOrKeyOrReport) {
            throw new AppError("Url doesn't contain a valid entry identificator", {
                code: ErrorCode.IncorrectURL,
            });
        }

        const params = parse(url.searchParams.toString()) as StringParams;

        let entry: GetEntryMetaResponse | GetEntryByKeyResponse;

        const {extractEntryId} = registry.common.functions.getAll();

        const possibleEntryId = extractEntryId(idOrKeyOrReport);

        if (possibleEntryId) {
            entry = await getEntryMeta({entryId: possibleEntryId});
        } else {
            throw new AppError('Incorrect entry identificator', {
                code: ErrorCode.IncorrectURL,
            });
        }

        ctx.log('RESOLVE_ENTRY_BY_LINK_SUCCESS', {originalUrl, entryId: entry.entryId, params});

        return {
            entry,
            params,
        };
    } catch (error) {
        ctx.logError('RESOLVE_ENTRY_BY_LINK_FAILED', error, {originalUrl});

        if (typeof error === 'object' && error !== null) {
            if (error instanceof AppError || ('error' in error && Boolean(error.error))) {
                throw error;
            } else if ('response' in error && error.response) {
                const response = error.response;
                if (typeof response === 'object' && response !== null && 'status' in response) {
                    if (response.status === 403) {
                        throw AppError.wrap(error as unknown as Error, {
                            code: ErrorCode.Forbidden,
                        });
                    }

                    if (response.status === 404) {
                        throw AppError.wrap(error as unknown as Error, {
                            code: ErrorCode.NotFound,
                        });
                    }
                }
            }
        }

        throw AppError.wrap(error as Error, {code: ErrorCode.Unknown});
    }
}

export default resolveEntryByLink;
