import type {MarkdownItPluginCb} from '@diplodoc/transform/lib/plugins/typings';
import type {ExpressKit, Request, Response} from '@gravity-ui/expresskit';
import type {ApiWithRoot, GatewayConfig, SchemasByScope} from '@gravity-ui/gateway';
import {getGatewayControllers} from '@gravity-ui/gateway';
import type {AppContext} from '@gravity-ui/nodekit';
import _ from 'lodash';

import {getValidationSchema, registerValidationSchema} from '../../shared/schema/gateway-utils';
import type {ChartsEngine} from '../components/charts-engine';
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
) => {
    const typedSchemasMap = Object.keys(schemasByScope).reduce<Record<string, any>>(
        (memo, scope) => {
            const services = schemasByScope[scope];
            Object.keys(services).forEach((service) => {
                const actions = services[service].actions;

                Object.entries(actions).forEach(([action, actionConfig]) => {
                    const validationSchema = getValidationSchema(actionConfig);

                    if (validationSchema) {
                        memo[`${scope}.${service}.${action}`] = validationSchema;
                    }
                });
            });

            return memo;
        },
        {},
    );

    const controllers = getGatewayControllers<SchemasByScope, AppContext, Request, Response>(
        schemasByScope,
        config,
    );

    Object.entries(typedSchemasMap).forEach(([actionPath, schema]) => {
        const actionCallback = _.get(controllers.api, actionPath, null);

        if (actionCallback) {
            registerValidationSchema(actionCallback, schema);
        }
    });

    return controllers;
};

let gateway: ReturnType<typeof wrapperGetGatewayControllers>;
let publicSchema: any;
let getLayoutConfig: GetLayoutConfig | undefined;
let yfmPlugins: MarkdownItPluginCb[];
let getXlsxConverter: XlsxConverterFn | undefined;
let qLConnectionTypeMap: QLConnectionTypeMap | undefined;

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
        publicSchemaArg?: any, // TODO @flops
    ) {
        if (gateway) {
            throw new Error('The method must not be called more than once');
        }
        gateway = wrapperGetGatewayControllers(schemasByScope, config);
        publicSchema = publicSchemaArg;
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
    getPublicApi() {
        if (!publicSchema) {
            throw new Error('First of all setup the publicSchema');
        }

        return publicSchema;
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
};
