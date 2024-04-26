import {MarkdownItPluginCb} from '@diplodoc/transform/lib/plugins/typings';
import {ExpressKit, Request, Response} from '@gravity-ui/expresskit';
import getGatewayControllers, {
    ApiWithRoot,
    GatewayConfig,
    SchemasByScope,
} from '@gravity-ui/gateway';
import {AppContext} from '@gravity-ui/nodekit';

import type {ChartsEngine} from '../components/charts-engine';
import {convertConnectionType} from '../modes/charts/plugins/ql/utils/connection';
import {GetLayoutConfig} from '../types/app-layout';
import type {ConvertConnectorTypeToQLConnectionType} from '../types/connections';
import {XlsxConverterFn} from '../types/xlsxConverter';

import commonRegistry from './units/common';

let app: ExpressKit;
let chartsEngine: ChartsEngine;

const wrapperGetGatewayControllers = (
    schemasByScope: SchemasByScope,
    config: GatewayConfig<AppContext, Request, Response>,
) => getGatewayControllers<SchemasByScope, AppContext, Request, Response>(schemasByScope, config);

let gateway: ReturnType<typeof wrapperGetGatewayControllers>;
let getLayoutConfig: GetLayoutConfig | undefined;
let yfmPlugins: MarkdownItPluginCb[];
let getXlsxConverter: XlsxConverterFn | undefined;
let convertConnectorTypeToQLConnectionType: ConvertConnectorTypeToQLConnectionType | undefined;

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
    registerConvertConnectorTypeToQLConnectionType(fn: ConvertConnectorTypeToQLConnectionType) {
        if (!convertConnectorTypeToQLConnectionType) {
            convertConnectorTypeToQLConnectionType = fn;
        }
    },
    getConvertConnectorTypeToQLConnectionType() {
        if (!convertConnectorTypeToQLConnectionType) {
            return convertConnectionType;
        }
        return convertConnectorTypeToQLConnectionType;
    },
};
