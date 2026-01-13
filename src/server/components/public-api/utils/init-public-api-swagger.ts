import {OpenApiGeneratorV31} from '@asteasolutions/zod-to-openapi';
import type {OpenAPIObjectConfigV31} from '@asteasolutions/zod-to-openapi/dist/v3.1/openapi-generator';
import type {ExpressKit} from '@gravity-ui/expresskit';
import swaggerUi from 'swagger-ui-express';

import {objectKeys} from '../../../../shared';
import {registry} from '../../../registry';
import {OPEN_API_VERSION_HEADER_COMPONENT_NAME, PUBLIC_API_VERSION_HEADER} from '../constants';

export const initPublicApiSwagger = (app: ExpressKit) => {
    const {config} = app;

    const {baseConfig, securitySchemes, biOpenapiSchemas} = registry.getPublicApiConfig();

    const latestVersion = Math.max(...Object.keys(baseConfig).map(Number));

    setImmediate(() => {
        const versionToDocument = Object.entries(baseConfig).reduce<
            Record<string, ReturnType<OpenApiGeneratorV31['generateDocument']>>
        >((acc, [version, {openApi}]) => {
            if (securitySchemes) {
                Object.keys(securitySchemes).forEach((securityType) => {
                    openApi.registry.registerComponent('securitySchemes', securityType, {
                        ...securitySchemes[securityType],
                    });
                });
            }

            openApi.registry.registerComponent(
                'parameters',
                OPEN_API_VERSION_HEADER_COMPONENT_NAME,
                {
                    name: PUBLIC_API_VERSION_HEADER,
                    in: 'header',
                    required: true,
                    schema: {
                        type: 'string',
                        const: version,
                        example: version,
                    },
                    description: `API version header.`,
                },
            );

            const generator = new OpenApiGeneratorV31(openApi.registry.definitions);

            const generateDocumentParams: OpenAPIObjectConfigV31 = {
                openapi: '3.1.0',
                info: {
                    version,
                    title: `DataLens API `,
                },
                servers: [{url: '/'}],
            };

            acc[version] = generator.generateDocument(generateDocumentParams);

            return acc;
        }, {});

        const versions = objectKeys(baseConfig).map(Number);

        versions.forEach((version) => {
            const openApiDocument = versionToDocument[version];

            openApiDocument.components = openApiDocument.components ?? {};

            openApiDocument.components.schemas = {
                ...openApiDocument.components?.schemas,
                ...biOpenapiSchemas,
            };
            const versionPath = `/${version}/`;
            const isLatest = version === latestVersion;

            const addSwaggerRoutes = (basePath: string) => {
                const jsonPath = `${basePath}json/`;

                app.express.get(jsonPath, (req, res) => {
                    const host = req.get('host');
                    const serverUrl = `https://${host}`;

                    openApiDocument.servers = [{url: serverUrl}];

                    return res.json(openApiDocument);
                });

                const options = {
                    customfavIcon: config.faviconUrl,
                    customSiteTitle: 'DataLens API',
                    customCss: '.swagger-ui .topbar { display: none }',
                    swaggerOptions: {
                        url: jsonPath,
                        validatorUrl: null,
                        tagsSorter: 'alpha',
                        operationsSorter: 'alpha',
                    },
                };

                app.express.use(basePath, swaggerUi.serveFiles(undefined, options));

                app.express.get(basePath, swaggerUi.setup(null, options));
            };

            addSwaggerRoutes(versionPath);

            if (isLatest) {
                addSwaggerRoutes('/');
            }
        });
    });
};
