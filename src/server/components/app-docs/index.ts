// eslint-disable-next-line import/no-extraneous-dependencies
import {OpenAPIRegistry, OpenApiGeneratorV31} from '@asteasolutions/zod-to-openapi';
import type {ExpressKit} from '@gravity-ui/expresskit';
// eslint-disable-next-line import/no-extraneous-dependencies
import swaggerUi from 'swagger-ui-express';

export const openApiRegistry = new OpenAPIRegistry();

export const initPublicApiSwagger = (
    app: ExpressKit,
    // securitySchemes?: GetAdditionalSecuritySchemesResult,
) => {
    const {config} = app;

    const installationText = `Installation – <b>${config.appInstallation}</b>`;
    const envText = `Env – <b>${config.appEnv}</b>`;
    const descriptionText = `<br />Datalens api.`;

    setImmediate(() => {
        openApiRegistry.registerComponent('securitySchemes', 'Access token', {
            type: 'apiKey',
            in: 'header',
            name: 'x-yacloud-subjecttoken',
        });

        openApiRegistry.registerComponent('securitySchemes', 'Access token 2', {
            type: 'apiKey',
            in: 'header',
            name: 'x-dl-org-id',
        });

        const openApiDocument = new OpenApiGeneratorV31(
            openApiRegistry.definitions,
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
