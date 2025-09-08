import type {ZodMediaTypeObject} from '@asteasolutions/zod-to-openapi';
import {OpenAPIRegistry, OpenApiGeneratorV31} from '@asteasolutions/zod-to-openapi';
import type {OpenAPIObjectConfigV31} from '@asteasolutions/zod-to-openapi/dist/v3.1/openapi-generator';
import type {ExpressKit} from '@gravity-ui/expresskit';
import {AppError} from '@gravity-ui/nodekit';
import swaggerUi from 'swagger-ui-express';
import z from 'zod';
import z4 from 'zod/v4';

import {getValidationSchema} from '../../../../shared/schema/gateway-utils';
import {registry} from '../../../registry';
import type {DatalensGatewaySchemas} from '../../../types/gateway';
import {CONTENT_TYPE_JSON} from '../../api-docs/constants';
import {PUBLIC_API_HTTP_METHOD, PUBLIC_API_URL} from '../constants';
import type {PublicApiSecuritySchemes} from '../types';

export const publicApiOpenApiRegistry = new OpenAPIRegistry();

const resolveUrl = ({version, action}: {version: string; action: string}) => {
    return PUBLIC_API_URL.replace(':version', version).replace(':action', action);
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

export const initPublicApiSwagger = (
    app: ExpressKit,
    securitySchemes?: PublicApiSecuritySchemes,
) => {
    const {config} = app;

    const installationText = `Installation – <b>${config.appInstallation}</b>`;
    const envText = `Env – <b>${config.appEnv}</b>`;
    const descriptionText = `<br />Datalens api.`;

    setImmediate(() => {
        const {gatewayApi} = registry.getGatewayApi<DatalensGatewaySchemas>();
        const schemasByScope = registry.getGatewaySchemasByScope();
        const {proxyMap, securityTypes} = registry.getPublicApiConfig();

        const actionToPathMap = new Map<Function, {serviceName: string; actionName: string}>();

        Object.entries(gatewayApi).forEach(([serviceName, actions]) => {
            Object.entries(actions).forEach(([actionName, action]) => {
                actionToPathMap.set(action, {serviceName, actionName});
            });
        });

        const security = securityTypes.map((type) => ({
            [type]: [],
        }));

        Object.entries(proxyMap).forEach(([version, actions]) => {
            Object.entries(actions).forEach(([action, {resolve, openApi}]) => {
                const gatewayApiAction = resolve(gatewayApi);

                const pathObject = actionToPathMap.get(gatewayApiAction);

                if (!pathObject) {
                    throw new AppError('Public api proxyMap action not found in gatewayApi.');
                }

                const actionConfig =
                    schemasByScope.root[pathObject.serviceName].actions[pathObject.actionName];

                const actionSchema = getValidationSchema(actionConfig);

                if (actionSchema) {
                    publicApiOpenApiRegistry.registerPath({
                        method: PUBLIC_API_HTTP_METHOD.toLocaleLowerCase() as Lowercase<
                            typeof PUBLIC_API_HTTP_METHOD
                        >,
                        path: resolveUrl({version, action}),
                        ...openApi,
                        request: {
                            body: {
                                content: {
                                    [CONTENT_TYPE_JSON]: {
                                        schema: z4.toJSONSchema(
                                            actionSchema.argsSchema,
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
                                            actionSchema.bodySchema,
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
                        path: resolveUrl({version, action}),
                        ...openApi,
                        ...defaultSchema,
                        security,
                    });
                }
            });
        });

        if (securitySchemes) {
            Object.keys(securitySchemes).forEach((securityType) => {
                publicApiOpenApiRegistry.registerComponent('securitySchemes', securityType, {
                    ...securitySchemes[securityType],
                });
            });
        }

        const generator = new OpenApiGeneratorV31(publicApiOpenApiRegistry.definitions);

        const generateDocumentParams: OpenAPIObjectConfigV31 = {
            openapi: '3.1.0',
            info: {
                version: `${config.appVersion}`,
                title: `UI API `,
                description: [installationText, envText, descriptionText].join('<br />'),
            },
            servers: [{url: '/'}],
        };

        const openApiDocument = generator.generateDocument(generateDocumentParams);

        app.express.get('/api-docs.json', (req, res) => {
            const host = req.get('host');
            const serverUrl = `https://${host}`;

            const result: typeof openApiDocument = {
                ...openApiDocument,
                servers: [{url: serverUrl}],
            };

            return res.json(result);
        });

        app.express.use('/api-docs/', swaggerUi.serve, swaggerUi.setup(openApiDocument));
    });
};
