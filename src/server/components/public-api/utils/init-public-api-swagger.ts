// eslint-disable-next-line import/no-extraneous-dependencies
import {OpenAPIRegistry, OpenApiGeneratorV31} from '@asteasolutions/zod-to-openapi';
import type {ExpressKit} from '@gravity-ui/expresskit';
// eslint-disable-next-line import/no-extraneous-dependencies
import swaggerUi from 'swagger-ui-express';

import type {PublicApiSecuritySchemes} from '../types';

export const publicApiOpenApiRegistry = new OpenAPIRegistry();

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

        const openApiDocument = new OpenApiGeneratorV31(
            publicApiOpenApiRegistry.definitions,
        ).generateDocument({
            openapi: '3.1.0',
            info: {
                version: `${config.appVersion}`,
                title: `UI API `,
                description: [installationText, envText, descriptionText].join('<br />'),
            },
            servers: [{url: '/'}],
        });

        app.express.get('/api-docs.json', (_, res) => res.json(openApiDocument));

        app.express.use('/api-docs/', swaggerUi.serve, swaggerUi.setup(openApiDocument));
    });
};
