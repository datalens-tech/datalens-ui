import type {IncomingHttpHeaders} from 'http';
import {stringify} from 'querystring';

import type {AppContext} from '@gravity-ui/nodekit';
import pick from 'lodash/pick';

import type {GetEntryByKeyResponse, GetEntryMetaResponse} from '../../schema';
import {filterUrlFragment} from '../../schema/utils';
import type {
    CreateEntryRequest,
    Entry,
    EntryReadParams,
    EntryScope,
    EntryUpdateMode,
    State,
    UpdateEntryRequest,
} from '../../types';

import {getAxios} from './axios';

class US {
    static async createEntry(
        data: CreateEntryRequest,
        headers: IncomingHttpHeaders,
        ctx: AppContext,
    ): Promise<Entry> {
        try {
            const {data: result} = await getAxios(ctx.config)({
                method: 'POST',
                url: `${ctx.config.endpoints.api.us}/v1/entries`,
                headers,
                data,
            });

            ctx.log('SDK_US_CREATE_ENTRY_SUCCESS', US.getLoggedEntry(result));

            return result;
        } catch (error) {
            ctx.logError('SDK_US_CREATE_ENTRY_FAILED', error, US.getLoggedErrorEntry(data));

            throw error;
        }
    }

    static async readEntry(
        entryId: string,
        params: EntryReadParams | null,
        headers: IncomingHttpHeaders,
        ctx: AppContext,
    ): Promise<Entry> {
        try {
            const {data} = await getAxios(ctx.config)({
                method: 'GET',
                url: `${ctx.config.endpoints.api.us}/v1/entries/${filterUrlFragment(entryId)}`,
                headers,
                params,
                'axios-retry': {retries: 1},
            });

            ctx.log('SDK_US_READ_ENTRY_SUCCESS', US.getLoggedEntry(data));

            return data;
        } catch (error) {
            ctx.logError('SDK_US_READ_ENTRY_FAILED', error, {entryId, params});

            throw error;
        }
    }

    static async updateEntry(
        entryId: string,
        mode: EntryUpdateMode,
        data: UpdateEntryRequest,
        headers: IncomingHttpHeaders,
        ctx: AppContext,
    ): Promise<Entry> {
        try {
            const {data: result} = await getAxios(ctx.config)({
                method: 'POST',
                url: `${ctx.config.endpoints.api.us}/v1/entries/${filterUrlFragment(entryId)}`,
                headers,
                data: {
                    ...data,
                    mode,
                },
            });

            ctx.log('SDK_US_UPDATE_ENTRY_SUCCESS', US.getLoggedEntry(result));

            return result;
        } catch (error) {
            ctx.logError('SDK_US_UPDATE_ENTRY_FAILED', error, {
                entryId,
                ...US.getLoggedErrorEntry(data),
            });

            throw error;
        }
    }

    static async deleteEntry(
        entryId: string,
        headers: IncomingHttpHeaders,
        ctx: AppContext,
    ): Promise<Entry> {
        try {
            const {data} = await getAxios(ctx.config)({
                method: 'delete',
                url: `${ctx.config.endpoints.api.us}/v1/entries/${filterUrlFragment(entryId)}`,
                headers,
            });

            ctx.log('SDK_US_DELETE_ENTRY_SUCCESS', US.getLoggedEntry(data));

            return data;
        } catch (error) {
            ctx.logError('SDK_US_DELETE_ENTRY_FAILED', error, {entryId});

            throw error;
        }
    }

    static async getEntryMeta(
        entryId: string,
        params: EntryReadParams | null,
        headers: IncomingHttpHeaders,
        ctx: AppContext,
    ): Promise<GetEntryMetaResponse> {
        try {
            const {data} = await getAxios(ctx.config)({
                method: 'GET',
                url: `${ctx.config.endpoints.api.us}/v1/entries/${filterUrlFragment(entryId)}/meta`,
                headers,
                params,
                'axios-retry': {retries: 1},
            });

            ctx.log('SDK_US_READ_ENTRY_META_SUCCESS', US.getLoggedEntry(data));

            return data;
        } catch (error) {
            ctx.logError('SDK_US_READ_ENTRY_META_FAILED', error, {entryId, params});

            throw error;
        }
    }

    static async getEntryByKey(
        key: string,
        params: EntryReadParams | null,
        headers: IncomingHttpHeaders,
        ctx: AppContext,
    ): Promise<GetEntryByKeyResponse> {
        try {
            const {data} = await getAxios(ctx.config)({
                method: 'GET',
                url: `${ctx.config.endpoints.api.us}/v1/entriesByKey`,
                headers,
                params: params ? {...params, key} : {key},
                'axios-retry': {retries: 1},
            });

            ctx.log('SDK_US_GET_ENTRY_BY_KEY_SUCCESS', US.getLoggedEntry(data));

            return data;
        } catch (error) {
            ctx.logError('SDK_US_GET_ENTRY_BY_KEY_FAILED', error, {key, params});

            throw error;
        }
    }

    static async getEntries(
        params: {
            ids: string[];
            scope: EntryScope;
        },
        headers: IncomingHttpHeaders,
        ctx: AppContext,
    ): Promise<{
        entries: Entry[];
    }> {
        try {
            const {data} = await getAxios(ctx.config)({
                method: 'GET',
                url: `${ctx.config.endpoints.api.us}/v1/entries`,
                headers,
                params,
                paramsSerializer: (params) => stringify(params),
                'axios-retry': {retries: 1},
            });

            ctx.log('SDK_US_GET_ENTRIES_SUCCESS', {count: data.length});

            return data;
        } catch (error) {
            ctx.logError('SDK_US_GET_ENTRIES_FAILED', error);

            throw error;
        }
    }

    static async getState(
        entryId: string,
        hash: string,
        headers: IncomingHttpHeaders,
        ctx: AppContext,
    ): Promise<State> {
        const logData = {entryId, hash};

        try {
            const {data} = await getAxios(ctx.config)({
                method: 'GET',
                url: `${ctx.config.endpoints.api.us}/v1/states/${filterUrlFragment(
                    entryId,
                )}/${filterUrlFragment(hash)}`,
                headers,
                'axios-retry': {retries: 1},
            });

            ctx.log('SDK_US_GET_STATE_SUCCESS', logData);

            return data;
        } catch (error) {
            ctx.logError('SDK_US_GET_STATE_FAILED', error, logData);

            throw error;
        }
    }

    static getLoggedEntry(entry: Entry) {
        return pick(entry, ['key', 'entryId', 'scope', 'type']);
    }

    static getLoggedErrorEntry(data: CreateEntryRequest | UpdateEntryRequest) {
        return pick(data, ['key', 'entryId', 'scope', 'type']);
    }
}

export default US;
