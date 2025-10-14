import type {OpenAPIRegistry, ZodMediaTypeObject} from '@asteasolutions/zod-to-openapi';
import z from 'zod/v4';

import {getValidationSchema} from '../../../../shared/schema/gateway-utils';
import {registry} from '../../../registry';
import type {AnyApiServiceActionConfig} from '../../../types/gateway';
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
    actionConfig,
    actionName,
    openApi,
    openApiRegistry,
}: {
    actionConfig: AnyApiServiceActionConfig;
    actionName: string;
    openApi: {
        summary: string;
        tags?: string[];
    };
    openApiRegistry: OpenAPIRegistry;
}) => {
    const {securityTypes} = registry.getPublicApiConfig();
    const actionSchema = getValidationSchema(actionConfig);

    const security = securityTypes.map((type) => ({
        [type]: [],
    }));

    if (!actionSchema) {
        throw new Error(`Action schema not found for action: ${actionName}`);
    }

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
                        schema: z.toJSONSchema(
                            actionSchema.paramsSchema,
                        ) as ZodMediaTypeObject['schema'],
                    },
                },
            },
        },
        responses: {
            200: {
                description: 'Response',
                content: {
                    [CONTENT_TYPE_JSON]: {
                        schema: z.toJSONSchema(
                            actionSchema.resultSchema,
                        ) as ZodMediaTypeObject['schema'],
                    },
                },
            },
        },
        security,
        parameters: [{$ref: `#/components/parameters/${OPEN_API_VERSION_HEADER_COMPONENT_NAME}`}],
    });
};
