import * as z from 'zod/v4';

import {
    CONTROLS_PLACEMENT_MODE,
    DASH_CURRENT_SCHEME_VERSION,
    DashLoadPriority,
    DashTabConnectionKind,
    DashTabItemControlElementType,
    DashTabItemControlSourceType,
    DashTabItemTitleSizes,
    DashTabItemType,
} from '..';

const DASH_DEFAULT_NAMESPACE = 'default';

// Text definition
const textSchema = z.object({
    text: z.string(),
});

// Title definition
const titleSchema = z.object({
    text: z.string(),
    size: z.enum(DashTabItemTitleSizes),
    showInTOC: z.boolean(),
});

// Widget definition
const widgetSchema = z.object({
    hideTitle: z.boolean(),
    tabs: z.array(
        z.object({
            id: z.string().min(1),
            title: z.string().min(1),
            description: z.string(),
            chartId: z.string().min(1),
            isDefault: z.boolean(),
            params: z.record(z.any(), z.any()),
            autoHeight: z.boolean().optional(),
        }),
    ),
});

// Control element type definition
const controlElementTypeSchema = z
    .object({
        required: z.boolean().optional(),
        showHint: z.boolean().optional(),
        showTitle: z.boolean(),
        elementType: z.enum(DashTabItemControlElementType),
    })
    .and(
        z.discriminatedUnion('elementType', [
            z.object({
                elementType: z.literal(DashTabItemControlElementType.Select),
                defaultValue: z.union([z.string(), z.array(z.string())]),
                multiselectable: z.boolean(),
            }),
            z.object({
                elementType: z.literal(DashTabItemControlElementType.Date),
                defaultValue: z.string(),
                isRange: z.boolean(),
            }),
            z.object({
                elementType: z.literal(DashTabItemControlElementType.Input),
                defaultValue: z.string(),
            }),
            z.object({
                elementType: z.literal(DashTabItemControlElementType.Checkbox),
                defaultValue: z.string(),
            }),
        ]),
    );

// Control source dataset definition
const controlSourceDatasetSchema = controlElementTypeSchema.and(
    z.object({
        datasetId: z.string().min(1),
        datasetFieldId: z.string().min(1),
    }),
);

// Control source manual definition
const controlSourceManualSchema = controlElementTypeSchema.and(
    z.object({
        fieldName: z.string().min(1),
        fieldType: z.string(),
        acceptableValues: z.union([
            // elementType: select
            z.array(
                z.object({
                    value: z.string(),
                    title: z.string(),
                }),
            ),
            // elementType: date
            z.object({
                from: z.string(),
                to: z.string(),
            }),
        ]),
    }),
);

// Control source external definition
const controlSourceExternalSchema = z.object({
    chartId: z.string().min(1),
    text: z.string().optional(),
    autoHeight: z.boolean().optional(),
});

// Control definition
const controlSchema = z
    .object({
        id: z.string().min(1),
        namespace: z.literal(DASH_DEFAULT_NAMESPACE),
        title: z.string().min(1),
        sourceType: z.enum(DashTabItemControlSourceType),
    })
    .and(
        z.discriminatedUnion('sourceType', [
            z.object({
                sourceType: z.literal(DashTabItemControlSourceType.Dataset),
                source: controlSourceDatasetSchema,
            }),
            z.object({
                sourceType: z.literal(DashTabItemControlSourceType.Manual),
                source: controlSourceManualSchema,
            }),
            z.object({
                sourceType: z.literal(DashTabItemControlSourceType.External),
                source: controlSourceExternalSchema,
            }),
        ]),
    );

// Group control items definition
const groupControlItemsSchema = z
    .object({
        id: z.string().min(1),
        title: z.string().min(1),
        namespace: z.literal(DASH_DEFAULT_NAMESPACE),
        sourceType: z.union([
            z.literal(DashTabItemControlSourceType.Dataset),
            z.literal(DashTabItemControlSourceType.Manual),
        ]),
        defaults: z.record(z.any(), z.any()),
        placementMode: z.enum(CONTROLS_PLACEMENT_MODE).optional(),
        width: z.string().optional(),
    })
    .and(
        z.discriminatedUnion('sourceType', [
            z.object({
                sourceType: z.literal(DashTabItemControlSourceType.Dataset),
                source: controlSourceDatasetSchema,
            }),
            z.object({
                sourceType: z.literal(DashTabItemControlSourceType.Manual),
                source: controlSourceManualSchema,
            }),
        ]),
    );

// Group control definition
const groupControlSchema = z.object({
    group: z.array(groupControlItemsSchema),
    autoHeight: z.boolean(),
    buttonApply: z.boolean(),
    buttonReset: z.boolean(),
    showGroupName: z.boolean(),
    updateControlsOnChange: z.boolean().optional(),
});

// Layout item definition
const layoutItemSchema = z.object({
    i: z.string().min(1),
    h: z.number(),
    w: z.number(),
    x: z.number(),
    y: z.number(),
    parent: z.string().optional(),
});

// Connection definition
const connectionSchema = z.object({
    from: z.string().min(1),
    to: z.string().min(1),
    kind: z.enum(DashTabConnectionKind),
});

// Tab item definition
const tabItemSchema = z
    .object({
        id: z.string().min(1),
        namespace: z.literal(DASH_DEFAULT_NAMESPACE),
        type: z.enum(DashTabItemType),
    })
    .and(
        z.discriminatedUnion('type', [
            z.object({
                type: z.literal(DashTabItemType.Text),
                data: textSchema,
            }),
            z.object({
                type: z.literal(DashTabItemType.Title),
                data: titleSchema,
            }),
            z.object({
                type: z.literal(DashTabItemType.Widget),
                data: widgetSchema,
            }),
            z.object({
                type: z.literal(DashTabItemType.Control),
                data: controlSchema,
                defaults: z.record(z.any(), z.any()),
            }),
            z.object({
                type: z.literal(DashTabItemType.GroupControl),
                data: groupControlSchema,
                defaults: z.record(z.any(), z.union([z.string(), z.array(z.string())])),
            }),
        ]),
    );

// Alias definition
const aliasRecordSchema = z.array(z.string().min(1)).max(2).min(2);

// Tab definition
const tabSchema = z
    .object({
        id: z.string().min(1),
        title: z.string().min(1),
        items: z.array(tabItemSchema),
        layout: z.array(layoutItemSchema),
        connections: z.array(connectionSchema),
        aliases: z
            .object({
                [DASH_DEFAULT_NAMESPACE]: z.array(aliasRecordSchema).optional(),
            })
            .strict(),
    })
    .strict();

// Settings definition
const settingsSchema = z.object({
    autoupdateInterval: z.union([z.number().min(30), z.null()]),
    maxConcurrentRequests: z.union([z.number().min(1), z.null()]),
    loadPriority: z.enum(DashLoadPriority).optional(),
    silentLoading: z.boolean(),
    dependentSelectors: z.boolean(),
    globalParams: z.record(z.any(), z.any()).optional(),
    hideTabs: z.boolean(),
    hideDashTitle: z.boolean().optional(),
    expandTOC: z.boolean(),
    assistantEnabled: z.boolean().optional(),
});

// Data definition
export const dataSchema = z.object({
    counter: z.number().int().min(1),
    salt: z.string().min(1),
    schemeVersion: z.number().int().min(1).max(DASH_CURRENT_SCHEME_VERSION), // !? HOW TO SET VERSION PROPERLY !?
    tabs: z.array(tabSchema),
    settings: settingsSchema,
    supportDescription: z.string().optional(),
    accessDescription: z.string().optional(),
});

// Main dashboard API validation schema
export const dashSchema = z.object({
    key: z.string().min(1).optional(),
    workbookId: z.union([z.null(), z.string()]).optional(),
    data: dataSchema,
    meta: z.record(z.any(), z.any()).optional(),
    links: z.record(z.string(), z.string()).optional(),
});

export const dashApiValidationJsonSchema = z.toJSONSchema(dashSchema);

// Export the type for TypeScript usage
export type DashSchema = z.infer<typeof dashSchema>;
