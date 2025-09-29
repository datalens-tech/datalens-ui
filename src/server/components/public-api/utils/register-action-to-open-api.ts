import type {OpenAPIRegistry, ZodMediaTypeObject} from '@asteasolutions/zod-to-openapi';
import z from 'zod/v4';

import {registry} from '../../../registry';
import {CONTENT_TYPE_JSON} from '../../api-docs/constants';
import {
    OPEN_API_VERSION_HEADER_COMPONENT_NAME,
    PUBLIC_API_HTTP_METHOD,
    PUBLIC_API_URL,
} from '../constants';

const resolveUrl = ({actionName}: {actionName: string}) => {
    return PUBLIC_API_URL.replace(':action', actionName);
};

export const registerActionToOpenApi = ({
    schemas,
    actionName,
    openApi,
    openApiRegistry,
}: {
    schemas: {args: z.ZodType; result: z.ZodType};
    actionName: string;
    openApi: {
        summary: string;
        tags?: string[];
    };
    openApiRegistry: OpenAPIRegistry;
}) => {
    const {securityTypes} = registry.getPublicApiConfig();

    const security = securityTypes.map((type) => ({
        [type]: [],
    }));

    openApiRegistry.registerPath({
        method: PUBLIC_API_HTTP_METHOD.toLocaleLowerCase() as Lowercase<
            typeof PUBLIC_API_HTTP_METHOD
        >,
        path: resolveUrl({actionName}),
        ...openApi,
        request: {
            body: {
                content: {
                    [CONTENT_TYPE_JSON]: {
                        schema: z.toJSONSchema(schemas.args) as ZodMediaTypeObject['schema'],
                    },
                },
            },
        },
        responses: {
            200: {
                description: 'Response',
                content: {
                    [CONTENT_TYPE_JSON]: {
                        schema: z.toJSONSchema(schemas.result) as ZodMediaTypeObject['schema'],
                    },
                },
            },
        },
        security,
        parameters: [{$ref: `#/components/parameters/${OPEN_API_VERSION_HEADER_COMPONENT_NAME}`}],
    });
};
