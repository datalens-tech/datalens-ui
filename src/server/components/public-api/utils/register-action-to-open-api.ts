import type {ZodMediaTypeObject} from '@asteasolutions/zod-to-openapi';
import z from 'zod';
import z4 from 'zod/v4';

import {getValidationSchema} from '../../../../shared/schema/gateway-utils';
import {registry} from '../../../registry';
import type {AnyApiServiceActionConfig} from '../../../types/gateway';
import {CONTENT_TYPE_JSON} from '../../api-docs/constants';
import {PUBLIC_API_HTTP_METHOD, PUBLIC_API_URL, publicApiOpenApiRegistry} from '../constants';

const resolveUrl = ({version, actionName}: {version: string; actionName: string}) => {
    return PUBLIC_API_URL.replace(':version', version).replace(':action', actionName);
};

const defaultSchema = {
    summary: 'Type not defined',
    request: {
        body: {
            content: {
                [CONTENT_TYPE_JSON]: {
                    schema: z.object({}),
                },
            },
        },
    },
    responses: {
        200: {
            description: 'TBD',
            content: {
                [CONTENT_TYPE_JSON]: {
                    schema: z.object({}),
                },
            },
        },
    },
};

export const registerActionToOpenApi = ({
    actionConfig,
    version,
    actionName,
    openApi,
}: {
    actionConfig: AnyApiServiceActionConfig;
    version: string;
    actionName: string;
    openApi: {
        summary: string;
        tags?: string[];
    };
}) => {
    const {securityTypes} = registry.getPublicApiConfig();

    const actionSchema = getValidationSchema(actionConfig);

    const security = securityTypes.map((type) => ({
        [type]: [],
    }));

    if (actionSchema) {
        publicApiOpenApiRegistry.registerPath({
            method: PUBLIC_API_HTTP_METHOD.toLocaleLowerCase() as Lowercase<
                typeof PUBLIC_API_HTTP_METHOD
            >,
            path: resolveUrl({version, actionName}),
            ...openApi,
            request: {
                body: {
                    content: {
                        [CONTENT_TYPE_JSON]: {
                            schema: z4.toJSONSchema(
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
                            schema: z4.toJSONSchema(
                                actionSchema.resultSchema,
                            ) as ZodMediaTypeObject['schema'],
                        },
                    },
                },
            },
            security,
        });
    } else {
        publicApiOpenApiRegistry.registerPath({
            method: PUBLIC_API_HTTP_METHOD.toLocaleLowerCase() as Lowercase<
                typeof PUBLIC_API_HTTP_METHOD
            >,
            path: resolveUrl({version, actionName}),
            ...openApi,
            ...defaultSchema,
            security,
        });
    }
};
