import {stringify} from 'querystring';

import type {ChartData} from '@gravity-ui/chartkit/gravity-charts';
import type {StringParams} from '@gravity-ui/chartkit/highcharts';
import type {AppContext} from '@gravity-ui/nodekit';
import type {AxiosRequestConfig} from 'axios';
import axios from 'axios';
import get from 'lodash/get';
import moment from 'moment';

import type {ChartComment} from '../../../../../shared';

const TEN_SECONDS = 10000;

type UsComment = ChartComment;

export type Graph = {
    id?: string;
    fname?: string;
    title?: string;
    name?: string;
    data: (number | number[] | {x: number; t?: string; v?: Date})[];
    type?: string;
};

type CommentsConfig = {
    feeds?: [
        {
            feed: string;
            matchedParams: string[];
        },
    ];
    matchType?: 'full' | 'contains';
    matchedParams?: string[];
    path?: string;
};

type CommentsFetcherFetchParams = {
    feeds: {feed: string; params: UsComment['params']}[];
    statFeed: {path: string; field_name: string} | null;
    meta: {matchType?: 'full' | 'contains'; dateFrom: string; dateTo: string};
};

export type CommentsFetcherPrepareCommentsParams = {
    chartName: string;
    config?: CommentsConfig;
    data:
        | {
              graphs: Graph[];
              categories_ms?: number[];
          }
        | Graph[];
    params: Record<string, string | string[]>;
};

export type CommentsFetcherFetchResult = {
    comments: UsComment[];
    logs: {path?: string; feed?: string; error: Error['message']}[];
};

export class CommentsFetcher {
    static async fetch(
        {feeds, meta: {matchType = 'full', dateFrom, dateTo}}: CommentsFetcherFetchParams,
        headers: AxiosRequestConfig['headers'],
        ctx: AppContext,
    ): Promise<CommentsFetcherFetchResult> {
        const comments: UsComment[] = [];
        const logs: {path?: string; feed?: string; error: Error['message']}[] = [];

        const usEndpoint = ctx.config.endpoints.api.us;

        // Filtering feeds to cancel loading same feeds
        const knownFeeds = new Set();
        const filteredFeeds = feeds.filter((feedData) => {
            if (knownFeeds.has(feedData.feed)) {
                return false;
            } else {
                knownFeeds.add(feedData.feed);
                return true;
            }
        });

        const requests = filteredFeeds.map(({feed, params = {}}) => {
            const paramsArray = Object.keys(params) as Array<keyof typeof params>;
            const processedParams = paramsArray.reduce<
                Record<string, string | string[] | undefined>
            >((result, key) => {
                result[`params[${key}]`] = params[key];
                return result;
            }, {});

            const query = stringify({
                feed,
                dateFrom,
                dateTo,
                ...processedParams,
                matchType,
            });

            return axios({
                method: 'get',
                url: `${usEndpoint}/v1/comments?${query}`,
                headers,
                timeout: TEN_SECONDS,
            }).then(
                (response) => {
                    return comments.push(...response.data);
                },
                (error) => {
                    logs.push({feed, error: error.message});
                    ctx.logError('FETCH_COMMENTS_UNITED_STORAGE_ERROR', error);
                },
            );
        });

        await Promise.all(requests);

        return {
            comments: comments.sort((a, b) => moment(b.date).valueOf() - moment(a.date).valueOf()),
            logs,
        };
    }

    static prepareComments(
        {chartName, config = {}, data, params}: CommentsFetcherPrepareCommentsParams,
        headers: AxiosRequestConfig['headers'],
        ctx: AppContext,
    ) {
        // Possible data structure:
        // * [{...},...]
        // * {graphs: [{...},...]}
        // * {graphs: [{...},...], categories_ms: [...]}
        const series = Array.isArray(data) ? data : data.graphs;

        if (!Array.isArray(series)) {
            return undefined;
        }

        const seriesIds = series.map(
            (graph) => graph.id || graph.fname || graph.title || graph.name || '',
        );

        let dateFromMs: number | undefined;
        let dateToMs: number | undefined;

        if (!Array.isArray(data) && data.categories_ms?.length) {
            dateFromMs = data.categories_ms[0];
            dateToMs = data.categories_ms[data.categories_ms.length - 1];
        } else {
            series.forEach(({data}) => {
                if (Array.isArray(data)) {
                    data.forEach((value) => {
                        let x;

                        if (Array.isArray(value)) {
                            x = value[0];
                        } else if (value !== null && typeof value === 'object') {
                            x = value.x;
                        }

                        if (typeof x === 'number') {
                            dateFromMs = dateFromMs === undefined ? x : Math.min(dateFromMs, x);
                            dateToMs = dateToMs === undefined ? x : Math.max(dateToMs, x);
                        }
                    });
                }
            });
        }

        if (!dateFromMs || !dateToMs) {
            return undefined;
        }

        const fetchCommentsArgs = getFetchCommentsArgs({
            config,
            chartName,
            params,
            seriesIds,
            dateFromMs,
            dateToMs,
        });
        return CommentsFetcher.fetch(
            {
                ...fetchCommentsArgs,
            },
            headers,
            ctx,
        );
    }

    static prepareGravityChartsComments(
        {
            chartName,
            config = {},
            data,
            params,
        }: {
            chartName: string;
            config?: CommentsConfig;
            data: Partial<ChartData>;
            params: StringParams;
        },
        headers: AxiosRequestConfig['headers'],
        ctx: AppContext,
    ) {
        const series = data.series?.data ?? [];

        const seriesIds = series.map<string>((s) => get(s, 'name', ''));

        let dateFromMs: number | undefined;
        let dateToMs: number | undefined;

        series.forEach((s) => {
            s.data.forEach((value) => {
                const field = s.type === 'bar-y' ? 'y' : 'x';
                const val = get(value, field);

                if (typeof val === 'number') {
                    dateFromMs = dateFromMs === undefined ? val : Math.min(dateFromMs, val);
                    dateToMs = dateToMs === undefined ? val : Math.max(dateToMs, val);
                }
            });
        });

        if (!dateFromMs || !dateToMs) {
            return undefined;
        }

        const fetchCommentsArgs = getFetchCommentsArgs({
            config,
            chartName,
            params,
            seriesIds,
            dateFromMs,
            dateToMs,
        });
        return CommentsFetcher.fetch(
            {
                ...fetchCommentsArgs,
            },
            headers,
            ctx,
        );
    }
}

function getFetchCommentsArgs({
    config,
    chartName,
    params,
    seriesIds,
    dateFromMs,
    dateToMs,
}: {
    config: CommentsConfig;
    chartName: string;
    params: StringParams;
    seriesIds: string[];
    dateFromMs: number;
    dateToMs: number;
}) {
    const {path, matchedParams = [], matchType, feeds = []} = config;
    return {
        feeds: [{feed: chartName, matchedParams}].concat(feeds).map(({feed, matchedParams = []}) =>
            matchedParams.reduce<{
                feed: string;
                params: Record<string, string | string[]>;
            }>(
                (result, name) => {
                    result.params[name] = params[name];
                    return result;
                },
                {feed, params: {}},
            ),
        ),
        statFeed: path ? {path, field_name: ['none'].concat(seriesIds).join(',')} : null,
        meta: {
            matchType,
            dateFrom: moment.utc(dateFromMs).format(),
            dateTo: moment.utc(dateToMs).format(),
        },
    };
}
