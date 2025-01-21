import type {Request, Response} from '@gravity-ui/expresskit';
import pick from 'lodash/pick';

import type {DashEntry, EntryReadParams} from '../../../../shared';
import {
    DASH_API_BASE_URL,
    DASH_CURRENT_SCHEME_VERSION,
    DashLoadPriority,
    DashTabConnectionKind,
    DashTabItemControlElementType,
    DashTabItemControlSourceType,
    DashTabItemTitleSizes,
    DashTabItemType,
    EntryScope,
    ErrorCode,
} from '../../../../shared';
import {Utils} from '../../../components';
import type {Plugin, PluginRoute} from '../../../components/charts-engine/types';
import {Dash} from '../../../components/sdk';
import {DASH_DEFAULT_NAMESPACE, DASH_ENTRY_RELEVANT_FIELDS} from '../../../constants';
import type {ValidationConfig} from '../../../lib/validation/types';

// TODO: add "additionalProperties: false" for all "type: object"
// in view of the existing incorrect schemes, we leave validation enabled only for internal installation
// (in particular, because there is a public API inside)
// dashboards in other installations are being run through purgeData while saving

export const dashApiValidation: ValidationConfig = {
    body: {
        definitions: {
            text: {
                type: 'object',
                required: ['text'],
                properties: {
                    text: {type: 'string'},
                },
            },
            title: {
                type: 'object',
                required: ['text', 'size'],
                properties: {
                    text: {type: 'string'},
                    size: {
                        enum: Object.values(DashTabItemTitleSizes),
                    },
                    showInTOC: {type: 'boolean'},
                },
            },
            widget: {
                type: 'object',
                required: ['tabs'],
                properties: {
                    hideTitle: {type: 'boolean'},
                    tabs: {
                        type: 'array',
                        items: {
                            type: 'object',
                            required: ['id', 'title'],
                            properties: {
                                id: {
                                    type: 'string',
                                    minLength: 1,
                                },
                                title: {
                                    type: 'string',
                                    minLength: 1,
                                },
                                description: {
                                    type: 'string',
                                },
                                chartId: {
                                    type: 'string',
                                    minLength: 1,
                                },
                                isDefault: {
                                    type: 'boolean',
                                },
                                params: {
                                    type: 'object',
                                },
                                autoHeight: {
                                    type: 'boolean',
                                },
                            },
                        },
                    },
                },
            },
            control: {
                type: 'object',
                required: ['title', 'sourceType', 'source'],
                properties: {
                    title: {
                        type: 'string',
                        minLength: 1,
                    },
                    sourceType: {
                        enum: Object.values(DashTabItemControlSourceType),
                    },
                },
                allOf: [
                    {
                        if: {
                            properties: {
                                sourceType: {
                                    const: DashTabItemControlSourceType.Dataset,
                                },
                            },
                        },
                        then: {
                            properties: {
                                source: {$ref: '#/definitions/controlSourceDataset'},
                            },
                        },
                    },
                    {
                        if: {
                            properties: {
                                sourceType: {
                                    const: DashTabItemControlSourceType.Manual,
                                },
                            },
                        },
                        then: {
                            properties: {
                                source: {$ref: '#/definitions/controlSourceManual'},
                            },
                        },
                    },
                    {
                        if: {
                            properties: {
                                sourceType: {
                                    const: DashTabItemControlSourceType.External,
                                },
                            },
                        },
                        then: {
                            properties: {
                                source: {$ref: '#/definitions/controlSourceExternal'},
                            },
                        },
                    },
                ],
            },
            controlSourceDataset: {
                allOf: [
                    {$ref: '#/definitions/controlElementType'},
                    {
                        type: 'object',
                        required: ['datasetId', 'datasetFieldId'],
                        properties: {
                            datasetId: {
                                type: 'string',
                                minLength: 1,
                            },
                            datasetFieldId: {
                                type: 'string',
                                minLength: 1,
                            },
                        },
                    },
                ],
            },
            controlSourceManual: {
                allOf: [
                    {$ref: '#/definitions/controlElementType'},
                    {
                        type: 'object',
                        required: ['fieldName'], // 'acceptableValues' is required for select and date, but not for input
                        properties: {
                            fieldName: {
                                type: 'string',
                                minLength: 1,
                            },
                            acceptableValues: {
                                oneOf: [
                                    // elementType: select
                                    {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            required: ['value', 'title'],
                                            properties: {
                                                value: {type: 'string'},
                                                title: {type: 'string'},
                                            },
                                        },
                                    },
                                    // elementType: date
                                    {
                                        type: 'object',
                                        properties: {
                                            from: {type: 'string'},
                                            to: {type: 'string'},
                                        },
                                    },
                                ],
                            },
                        },
                    },
                ],
            },
            controlSourceExternal: {
                type: 'object',
                required: ['chartId'],
                properties: {
                    text: {type: 'string'},
                    autoHeight: {type: 'boolean'},
                },
            },
            controlElementType: {
                type: 'object',
                required: ['elementType'],
                properties: {
                    showTitle: {type: 'boolean'},
                    elementType: {
                        enum: Object.values(DashTabItemControlElementType),
                    },
                },
                allOf: [
                    {
                        if: {
                            properties: {
                                elementType: {
                                    const: DashTabItemControlElementType.Select,
                                },
                            },
                        },
                        then: {
                            properties: {
                                defaultValue: {
                                    oneOf: [
                                        {type: 'string'},
                                        {
                                            type: 'array',
                                            items: {type: 'string'},
                                        },
                                        {type: 'null'},
                                    ],
                                },
                                multiselectable: {type: 'boolean'},
                            },
                        },
                    },
                    {
                        if: {
                            properties: {
                                elementType: {
                                    const: DashTabItemControlElementType.Date,
                                },
                            },
                        },
                        then: {
                            properties: {
                                defaultValue: {type: 'string'},
                                isRange: {type: 'boolean'},
                            },
                        },
                    },
                    {
                        if: {
                            properties: {
                                elementType: {
                                    const: DashTabItemControlElementType.Input,
                                },
                            },
                        },
                        then: {
                            properties: {
                                defaultValue: {type: 'string'},
                            },
                        },
                    },
                    {
                        if: {
                            properties: {
                                elementType: {
                                    const: DashTabItemControlElementType.Checkbox,
                                },
                            },
                        },
                        then: {
                            properties: {
                                defaultValue: {type: 'string'},
                            },
                        },
                    },
                ],
            },
        },

        type: 'object',
        properties: {
            key: {
                type: 'string',
                minLength: 1,
            },
            data: {
                type: 'object',
                required: ['tabs'],
                properties: {
                    counter: {
                        type: 'integer',
                        minimum: 1,
                    },
                    salt: {
                        type: 'string',
                        minLength: 1,
                    },
                    schemeVersion: {
                        type: 'integer',
                        minimum: 1,
                        maximum: DASH_CURRENT_SCHEME_VERSION,
                    },
                    tabs: {
                        type: 'array',
                        items: {
                            type: 'object',
                            required: ['id', 'title', 'items', 'layout', 'connections', 'aliases'],
                            properties: {
                                id: {
                                    type: 'string',
                                    minLength: 1,
                                },
                                title: {
                                    type: 'string',
                                    minLength: 1,
                                },
                                items: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        required: ['id', 'namespace', 'type'],
                                        properties: {
                                            id: {
                                                type: 'string',
                                                minLength: 1,
                                            },
                                            namespace: {
                                                const: DASH_DEFAULT_NAMESPACE,
                                                // uncomment when namespace is different from default
                                                // type: 'string',
                                                // minLength: 1,
                                            },
                                            type: {
                                                enum: Object.values(DashTabItemType),
                                            },
                                        },
                                        allOf: [
                                            {
                                                if: {
                                                    properties: {
                                                        type: {
                                                            const: DashTabItemType.Text,
                                                        },
                                                    },
                                                },
                                                then: {
                                                    required: ['data'],
                                                    properties: {
                                                        data: {
                                                            $ref: '#/definitions/text',
                                                        },
                                                    },
                                                },
                                            },
                                            {
                                                if: {
                                                    properties: {
                                                        type: {
                                                            const: DashTabItemType.Title,
                                                        },
                                                    },
                                                },
                                                then: {
                                                    required: ['data'],
                                                    properties: {
                                                        data: {
                                                            $ref: '#/definitions/title',
                                                        },
                                                    },
                                                },
                                            },
                                            {
                                                if: {
                                                    properties: {
                                                        type: {
                                                            const: DashTabItemType.Widget,
                                                        },
                                                    },
                                                },
                                                then: {
                                                    required: ['data'],
                                                    properties: {
                                                        data: {
                                                            $ref: '#/definitions/widget',
                                                        },
                                                    },
                                                },
                                            },
                                            {
                                                if: {
                                                    properties: {
                                                        type: {
                                                            const: DashTabItemType.Control,
                                                        },
                                                    },
                                                },
                                                then: {
                                                    required: ['data', 'defaults'],
                                                    properties: {
                                                        data: {
                                                            $ref: '#/definitions/control',
                                                        },
                                                        defaults: {type: 'object'},
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                },
                                layout: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        required: ['i', 'h', 'w', 'x', 'y'],
                                        properties: {
                                            i: {
                                                type: 'string',
                                                minLength: 1,
                                            },
                                            h: {type: 'number'},
                                            w: {type: 'number'},
                                            x: {type: 'number'},
                                            y: {type: 'number'},
                                        },
                                    },
                                },
                                aliases: {
                                    type: 'object',
                                    properties: {
                                        [DASH_DEFAULT_NAMESPACE]: {
                                            type: 'array',
                                            items: {
                                                type: 'array',
                                                items: {
                                                    type: 'string',
                                                    minLength: 1,
                                                },
                                                minItems: 2,
                                                uniqueItems: true,
                                            },
                                        },
                                    },
                                    additionalProperties: false,
                                    // uncomment when namespace is different from default
                                    // patternProperties: {
                                    //     '^.*$': {
                                    //         type: 'array',
                                    //         items: {
                                    //             ...
                                    //         },
                                    //     },
                                    // },
                                },
                                connections: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        required: ['from', 'to', 'kind'],
                                        properties: {
                                            from: {
                                                type: 'string',
                                                minLength: 1,
                                            },
                                            to: {
                                                type: 'string',
                                                minLength: 1,
                                            },
                                            kind: {
                                                enum: Object.values(DashTabConnectionKind),
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    settings: {
                        type: 'object',
                        properties: {
                            autoupdateInterval: {
                                // TODO: no need in string here, you need to save it correctly in the settings dialog
                                type: ['integer', 'string', 'null'],
                                minimum: 30,
                            },
                            maxConcurrentRequests: {
                                type: ['integer', 'null'],
                                minimum: 1,
                            },
                            loadPriority: {
                                enum: Object.values(DashLoadPriority),
                            },
                            silentLoading: {
                                type: 'boolean',
                            },
                            dependentSelectors: {
                                type: 'boolean',
                            },
                            globalParams: {
                                type: 'object',
                            },
                            hideTabs: {
                                type: 'boolean',
                            },
                            hideDashTitle: {
                                type: 'boolean',
                            },
                            expandTOC: {
                                type: 'boolean',
                            },
                        },
                    },
                },
            },
            meta: {
                type: 'object',
            },
            links: {
                type: 'object',
            },
        },
    },
};

function purgeResult(result: DashEntry) {
    return pick(result, DASH_ENTRY_RELEVANT_FIELDS);
}

type ConfiguredDashApiPluginOptions = {
    basePath?: string;
    privatePath?: string;
    /**
     * @deprecated use validationConfig instead
     */
    validate?: PluginRoute['validationConfig'];
    validationConfig?: PluginRoute['validationConfig'];
    routeParams?: Partial<Omit<PluginRoute, 'path' | 'method' | 'handler' | 'validate'>>;
    privateRouteParams?: Partial<Omit<PluginRoute, 'path' | 'method' | 'handler' | 'validate'>>;
};

const getRoutes = (options?: ConfiguredDashApiPluginOptions): Plugin['routes'] => {
    const {
        routeParams,
        privateRouteParams,
        validate,
        basePath = DASH_API_BASE_URL,
        privatePath,
    } = options || {};
    let {validationConfig} = options || {};
    if (validate && !validationConfig) {
        validationConfig = validate;
    }
    let routes: PluginRoute[] = [
        {
            method: 'POST',
            path: basePath,
            validationConfig,
            handler: async (req: Request, res: Response) => {
                try {
                    const {body, ctx} = req;
                    const I18n = req.ctx.get('i18n');

                    const result = await Dash.create(body, Utils.pickHeaders(req), ctx, I18n);

                    res.status(200).send(purgeResult(result));
                } catch (error) {
                    const errorCode = Utils.getErrorCode(error);
                    const errorStatus = errorCode === ErrorCode.ReadOnlyMode ? 451 : 500;
                    res.status(errorStatus).send({
                        message: Utils.getErrorMessage(error),
                        details: Utils.getErrorDetails(error),
                        code: errorCode,
                    });
                }
            },
            ...(routeParams || {}),
        },
        {
            method: 'GET',
            path: `${basePath}/:id`,
            handler: async (req: Request, res: Response) => {
                try {
                    const {
                        params: {id},
                        query,
                        ctx,
                    } = req;

                    if (!id || id === 'null') {
                        res.status(404).send({message: 'Dash not found'});
                        return;
                    }
                    const result = await Dash.read(
                        id,
                        query as unknown as EntryReadParams | null,
                        Utils.pickHeaders(req),
                        ctx,
                    );

                    if (result.scope !== EntryScope.Dash) {
                        res.status(404).send({message: 'No entry found'});
                        return;
                    }

                    res.status(200).send(purgeResult(result));
                } catch (error) {
                    const errorStatus = Utils.getErrorStatus(error) === 403 ? 403 : 500;
                    res.status(errorStatus).send({message: Utils.getErrorMessage(error)});
                }
            },
            ...(routeParams || {}),
        },
        {
            method: 'POST',
            path: `${basePath}/:id`,
            validationConfig,
            handler: async (req: Request, res: Response) => {
                try {
                    const {
                        params: {id},
                        body,
                        ctx,
                    } = req;

                    const I18n = req.ctx.get('i18n');

                    const result = await Dash.update(id, body, Utils.pickHeaders(req), ctx, I18n);

                    res.status(200).send(purgeResult(result));
                } catch (error) {
                    let errorStatus = 500;
                    if (Utils.getErrorStatus(error) === 403) {
                        errorStatus = 403;
                    } else if (Utils.getErrorCode(error) === ErrorCode.ReadOnlyMode) {
                        errorStatus = 451;
                    }
                    res.status(errorStatus).send({message: Utils.getErrorMessage(error)});
                }
            },
            ...(routeParams || {}),
        },
        {
            method: 'DELETE',
            path: `${basePath}/:id`,
            handler: async (req: Request, res: Response) => {
                try {
                    const {
                        params: {id},
                        ctx,
                    } = req;

                    const result = await Dash.delete(id, Utils.pickHeaders(req), ctx);

                    res.status(200).send(purgeResult(result));
                } catch (error) {
                    let errorStatus = 500;
                    if (Utils.getErrorStatus(error) === 403) {
                        errorStatus = 403;
                    } else if (Utils.getErrorCode(error) === ErrorCode.ReadOnlyMode) {
                        errorStatus = 451;
                    }
                    res.status(errorStatus).send({message: Utils.getErrorMessage(error)});
                }
            },
            ...(routeParams || {}),
        },
    ];

    if (privatePath) {
        routes = routes.concat(
            routes.map((route) => {
                return {
                    ...route,
                    path: route.path.replace(basePath, privatePath),
                    ...(privateRouteParams || {}),
                };
            }),
        );
    }

    return routes;
};

export function configuredDashApiPlugin(options?: ConfiguredDashApiPluginOptions): Plugin {
    return {
        routes: getRoutes(options),
    };
}
