import {OpenApiGeneratorV31} from '@asteasolutions/zod-to-openapi';
import type {OpenAPIObjectConfigV31} from '@asteasolutions/zod-to-openapi/dist/v3.1/openapi-generator';
import type {ExpressKit} from '@gravity-ui/expresskit';
import swaggerUi from 'swagger-ui-express';

import {objectKeys} from '../../../../shared';
import {registry} from '../../../registry';
import {PUBLIC_API_LATEST_VERSION} from '../constants';

export const initPublicApiSwagger = (app: ExpressKit) => {
    const {config} = app;

    const installationText = `Installation – <b>${config.appInstallation}</b>`;
    const envText = `Env – <b>${config.appEnv}</b>`;
    const descriptionText = `<br />Datalens api.`;

    const {baseConfig, securitySchemes} = registry.getPublicApiConfig();

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

            const generator = new OpenApiGeneratorV31(openApi.registry.definitions);

            const generateDocumentParams: OpenAPIObjectConfigV31 = {
                openapi: '3.1.0',
                info: {
                    version,
                    title: `DataLens API `,
                    description: [installationText, envText, descriptionText].join('<br />'),
                },
                servers: [{url: '/'}],
            };

            acc[version] = generator.generateDocument(generateDocumentParams);

            return acc;
        }, {});

        const versions = objectKeys(baseConfig);

        versions.forEach((version) => {
            const openApiDocument = versionToDocument[version];

            const versionPath = `/${version}/`;
            const isLatest = version === PUBLIC_API_LATEST_VERSION;

            const addSwaggerRoutes = (basePath: string) => {
                const jsonPath = `${basePath}json/`;

                app.express.get(jsonPath, (req, res) => {
                    const host = req.get('host');
                    const serverUrl = `https://${host}`;

                    const result: typeof openApiDocument = {
                        ...openApiDocument,
                        servers: [{url: serverUrl}],
                    };

                    return res.json(result);
                });

                const swaggerOptions = {
                    url: jsonPath,
                    validatorUrl: null,
                };

                app.express.use(
                    basePath,
                    swaggerUi.serveFiles(undefined, {
                        swaggerOptions,
                    }),
                );

                app.express.get(
                    basePath,
                    swaggerUi.setup(null, {
                        swaggerOptions,
                    }),
                );
            };

            addSwaggerRoutes(versionPath);

            if (isLatest) {
                addSwaggerRoutes('/');
            }
        });
    });
};
