import {OpenAPIRegistry} from '@asteasolutions/zod-to-openapi';

import type {PublicApiVersionConfig} from '../types';

import {ApiTag} from './common';

export const PUBLIC_API_VNULL_CONFIG = {
    openApi: {
        registry: new OpenAPIRegistry(),
    },

    actions: {
        // Connection
        deleteConnection: {
            resolve: (api) => api.bi.deleteConnection,
            openApi: {
                summary: 'Delete connection',
                tags: [ApiTag.Connection],
            },
        },
    },
} satisfies PublicApiVersionConfig;
