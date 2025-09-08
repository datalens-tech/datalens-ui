import type {MarkdownItPluginCb} from '@diplodoc/transform/lib/plugins/typings';
import type {ExpressKit, Request, Response} from '@gravity-ui/expresskit';
import type {ApiWithRoot, GatewayConfig, SchemasByScope} from '@gravity-ui/gateway';
import {getGatewayControllers} from '@gravity-ui/gateway';
import type {AppContext} from '@gravity-ui/nodekit';

import type {ChartsEngine} from '../components/charts-engine';
import type {PublicApiConfig} from '../components/public-api/types';
import type {QLConnectionTypeMap} from '../modes/charts/plugins/ql/utils/connection';
import {getConnectorToQlConnectionTypeMap} from '../modes/charts/plugins/ql/utils/connection';
import type {GetLayoutConfig} from '../types/app-layout';
import type {XlsxConverterFn} from '../types/xlsxConverter';

import commonRegistry from './units/common';

let app: ExpressKit;
let chartsEngine: ChartsEngine;

export const wrapperGetGatewayControllers = (
    schemasByScope: SchemasByScope,
    config: GatewayConfig<AppContext, Request, Response>,
) => getGatewayControllers<SchemasByScope, AppContext, Request, Response>(schemasByScope, config);

let gateway: ReturnType<typeof wrapperGetGatewayControllers>;
let gatewaySchemasByScope: SchemasByScope;
let getLayoutConfig: GetLayoutConfig | undefined;
let yfmPlugins: MarkdownItPluginCb[];
let getXlsxConverter: XlsxConverterFn | undefined;
let qLConnectionTypeMap: QLConnectionTypeMap | undefined;
let publicApiConfig: PublicApiConfig | undefined;

export const registry = {
    common: commonRegistry,
    setupApp(appInstance: ExpressKit) {
        if (app) {
            throw new Error('The method must not be called more than once');
        }
        app = appInstance;
    },
    getApp() {
        if (!app) {
            throw new Error('First of all setup the app');
        }
        return app;
    },
    setupChartsEngine(chartsEngineInstance: ChartsEngine) {
        if (chartsEngine) {
            throw new Error('The method must not be called more than once');
        }
        chartsEngine = chartsEngineInstance;
    },
    getChartsEngine() {
        if (!chartsEngine) {
            throw new Error('First of all setup the chartsEngine');
        }
        return chartsEngine;
    },
    setupGateway(
        config: GatewayConfig<Request['ctx'], Request, Response>,
        schemasByScope: SchemasByScope,
    ) {
        if (gateway) {
            throw new Error('The method must not be called more than once');
        }
        gateway = wrapperGetGatewayControllers(schemasByScope, config);
        gatewaySchemasByScope = schemasByScope;
    },
    getGatewayController() {
        if (!gateway) {
            throw new Error('First of all setup the gateway');
        }
        return {gatewayController: gateway.controller} as {
            gatewayController: (typeof gateway)['controller'];
        };
    },
    getGatewayApi<TSchema extends SchemasByScope>() {
        if (!gateway) {
            throw new Error('First of all setup the gateway');
        }
        return {gatewayApi: gateway.api} as {
            gatewayApi: ApiWithRoot<TSchema, Request['ctx'], Request, Response>;
        };
    },
    getGatewaySchemasByScope() {
        if (!gatewaySchemasByScope) {
            throw new Error('First of all setup the gateway');
        }

        return gatewaySchemasByScope;
    },
    registerGetLayoutConfig(fn: GetLayoutConfig) {
        if (getLayoutConfig) {
            throw new Error(
                'The method must not be called more than once [registerGetLayoutConfig]',
            );
        }
        getLayoutConfig = fn;
    },
    useGetLayoutConfig(...params: Parameters<GetLayoutConfig>) {
        if (!getLayoutConfig) {
            throw new Error('First of all register getLayoutConfig function');
        }
        return getLayoutConfig(...params);
    },
    setupYfmPlugins(plugins: MarkdownItPluginCb[]) {
        if (yfmPlugins) {
            throw new Error('The method must not be called more than once');
        }
        yfmPlugins = plugins;
    },
    getYfmPlugins() {
        return yfmPlugins;
    },
    setupXlsxConverter(fn: XlsxConverterFn) {
        if (getXlsxConverter) {
            throw new Error('The method setupXlsxConverter must not be called more than once');
        }
        getXlsxConverter = fn;
    },
    getXlsxConverter() {
        return getXlsxConverter;
    },
    setupQLConnectionTypeMap(map: QLConnectionTypeMap) {
        if (!qLConnectionTypeMap) {
            qLConnectionTypeMap = map;
        }
    },
    getQLConnectionTypeMap() {
        return qLConnectionTypeMap ?? getConnectorToQlConnectionTypeMap();
    },
    setupPublicApiConfig(config: PublicApiConfig) {
        if (publicApiConfig) {
            throw new Error('The method must not be called more than once [setupPublicApiConfig]');
        }
        publicApiConfig = config;
    },
    getPublicApiConfig() {
        if (!publicApiConfig) {
            throw new Error('First of all setup the publicApiConfig');
        }

        return publicApiConfig;
    },
};
