import * as path from 'path';

import {extendZodWithOpenApi} from '@asteasolutions/zod-to-openapi';
import {NodeKit} from '@gravity-ui/nodekit';
import dotenv from 'dotenv';
import {z} from 'zod';

extendZodWithOpenApi(z);
dotenv.config();

import {authSchema, schema} from '../shared/schema';

import {getFeaturesConfig} from './components/features';
import {registry} from './registry';
import {getGatewayConfig} from './utils/gateway';

const nodekit = new NodeKit({
    configsPath: path.resolve(__dirname, 'configs'),
});

const {appName, appEnv, appInstallation, appDevMode} = nodekit.config;
nodekit.ctx.log('AppConfig details', {
    appName,
    appEnv,
    appInstallation,
    appDevMode,
});

nodekit.config.features = getFeaturesConfig(appEnv);

registry.setupGateway(getGatewayConfig(nodekit), {
    root: schema,
    auth: authSchema,
});

export {nodekit};
