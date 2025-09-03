import type {IncomingHttpHeaders} from 'http';

import {CHARTS_API_BASE_URL, DASH_API_BASE_URL} from '../constants';
import type {Endpoints} from '../endpoints';
import {filterUrlFragment} from '../schema/utils';
import type {
    CreateEntryRequest,
    DashEntry,
    DashEntryCreateParams,
    EntryAnnotationArgs,
    EntryReadParams,
    Params,
    UpdateEntryRequest,
} from '../types';
import {EntryUpdateMode} from '../types';

type UiEndpoints = Endpoints['ui'];

export type CreateWidgetArgs =
    | {
          key: string;
          data: Record<string, unknown>;
          template?: string;
          annotation?: EntryAnnotationArgs;
      }
    | {
          workbookId: string;
          name: string;
          data: Record<string, unknown>;
          template?: string;
          annotation?: EntryAnnotationArgs;
      };

const CHARTS_API_SCHEMA = {
    getWidget: (
        headers: IncomingHttpHeaders,
        endpoints: UiEndpoints,
        {
            entryId,
            unreleased,
            revId,
        }: {
            entryId: string;
            unreleased?: boolean;
            revId?: string;
        },
    ) => {
        const params: Params = {
            includeLinks: '1',
            includePermissionsInfo: '1',
        };

        // previously, by default, if the unreleased parameter was not passed, true value was set
        // for the history of chart changes, change the default to return published version
        if (unreleased) {
            params.unreleased = '1';
        }

        if (revId) {
            params.revId = revId;
        }

        return {
            method: 'get',
            url: `${endpoints.charts}${CHARTS_API_BASE_URL}/${filterUrlFragment(entryId)}`,
            headers,
            params,
        };
    },
    createWidget: (
        headers: IncomingHttpHeaders,
        endpoints: UiEndpoints,
        {template = 'datalens', ...restArgs}: CreateWidgetArgs,
    ) => ({
        method: 'post',
        url: `${endpoints.charts}${CHARTS_API_BASE_URL}`,
        headers,
        data: {
            template,
            ...restArgs,
        },
    }),
    updateWidget: (
        headers: IncomingHttpHeaders,
        endpoints: UiEndpoints,
        {
            entryId,
            data,
            template = 'datalens',
            mode = EntryUpdateMode.Publish,
            annotation,
        }: {
            entryId: string;
            revId: string;
            data: any;
            template: string;
            mode?: EntryUpdateMode;
            annotation?: EntryAnnotationArgs;
        },
    ) => ({
        method: 'post',
        url: `${endpoints.charts}${CHARTS_API_BASE_URL}/${filterUrlFragment(entryId)}`,
        headers,
        data: {
            data,
            mode,
            template,
            annotation,
        },
    }),

    // DASH API
    createDash: (
        headers: IncomingHttpHeaders,
        endpoints: UiEndpoints,
        {data}: {data: CreateEntryRequest<DashEntry | DashEntryCreateParams>},
    ) => ({
        method: 'post',
        url: `${endpoints.charts}${DASH_API_BASE_URL}`,
        headers,
        data,
    }),
    readDash: (
        headers: IncomingHttpHeaders,
        endpoints: UiEndpoints,
        {
            id,
            params,
        }: {
            id: string;
            params: EntryReadParams;
        },
    ) => ({
        method: 'get',
        url: `${endpoints.charts}${DASH_API_BASE_URL}/${filterUrlFragment(id)}`,
        headers,
        params,
    }),
    updateDash: (
        headers: IncomingHttpHeaders,
        endpoints: UiEndpoints,
        {
            id,
            data,
        }: {
            id: string;
            data: UpdateEntryRequest<DashEntry>;
        },
    ) => ({
        method: 'post',
        url: `${endpoints.charts}${DASH_API_BASE_URL}/${filterUrlFragment(id)}`,
        headers,
        data,
    }),
};

export default CHARTS_API_SCHEMA;
