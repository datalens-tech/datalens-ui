import {OpenApiGeneratorV31} from '@asteasolutions/zod-to-openapi';
import type {OpenAPIObjectConfigV31} from '@asteasolutions/zod-to-openapi/dist/v3.1/openapi-generator';
import type {ExpressKit} from '@gravity-ui/expresskit';
import swaggerUi from 'swagger-ui-express';

import {publicApiOpenApiRegistry} from '../constants';
import type {PublicApiSecuritySchemes} from '../types';

export const initPublicApiSwagger = (
    app: ExpressKit,
    securitySchemes?: PublicApiSecuritySchemes,
) => {
    const {config} = app;

    const installationText = `Installation – <b>${config.appInstallation}</b>`;
    const envText = `Env – <b>${config.appEnv}</b>`;
    const descriptionText = `<br />Datalens api.`;

    setImmediate(() => {
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
