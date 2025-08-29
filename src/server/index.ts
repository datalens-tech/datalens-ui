import cluster from 'cluster';

// Without this import shared object is empty in runtime and it should be exactly here
import '../shared';
import type {AppEnvironment} from '../shared/constants/common';
import {getAppEndpointsConfig} from '../shared/endpoints';

import {appEnv} from './app-env';
import {appAuth} from './components/auth/middlewares/auth';
import {getOpensourceLayoutConfig} from './components/layout/opensource-layout-config';
import authZitadel from './middlewares/auth-zitadel';
import {getConnectorToQlConnectionTypeMap} from './modes/charts/plugins/ql/utils/connection';
import initOpensourceApp from './modes/opensource/app';
import {nodekit} from './nodekit';
import {registry} from './registry';
import {registerAppPlugins} from './registry/utils/register-app-plugins';

registry.registerGetLayoutConfig(getOpensourceLayoutConfig);
registry.setupQLConnectionTypeMap(getConnectorToQlConnectionTypeMap());

registerAppPlugins();

nodekit.config.endpoints = getAppEndpointsConfig(
    appEnv as AppEnvironment.Production | AppEnvironment.Development,
);

if (nodekit.config.isZitadelEnabled) {
    nodekit.config.appAuthHandler = authZitadel;
}

if (nodekit.config.isAuthEnabled) {
    nodekit.config.appAuthHandler = appAuth;
}

nodekit.config.appAllowedLangs = nodekit.config.regionalEnvConfig?.allowLanguages;
nodekit.config.appDefaultLang = nodekit.config.regionalEnvConfig?.defaultLang;

nodekit.config.appBeforeAuthMiddleware = [serverFeatureWithBoundedContext];

const app = initOpensourceApp(nodekit);
registry.setupApp(app);

if (nodekit.config.workers && nodekit.config.workers > 1 && cluster.isPrimary) {
    for (let i = 0; i < nodekit.config.workers; i++) {
        cluster.fork();
    }
} else {
    app.run();
}

if (process.env?.['LOCAL_DEV_PORT']) {
    import('./local-dev');
}
