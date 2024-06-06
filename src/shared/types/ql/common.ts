import type {QLChartType} from '../../constants';
import type {CommonSharedExtraSettings, ShapesConfig, Shared} from '../wizard/';
import type {Field} from '../wizard/field';

export interface QLResultEntryMetadataDataGroup {
    group: boolean;
    undragable: boolean;
    name: string;
    capacity?: number;
    size: number;
    id?: string;
    allowedTypes?: string[];
    pseudo?: boolean;
}

export interface QLResultEntryMetadataDataColumn {
    // typeName -- legacy type that is incompatible with Field
    // How to turn on wizard ql common visualization -- you can delete
    typeName: string;

    // biType -- a new type compatible with Field and general visualization section
    biType?: string;

    name: string;
    id?: string;
    undragable?: boolean;
    pseudo?: boolean;
}

export interface QLParamInterval {
    from: string | undefined;
    to: string | undefined;
}

export interface QLParam {
    name: string;
    type: string;
    defaultValue: string | string[] | QLParamInterval | undefined;
    overridenValue?: string | string[] | QLParamInterval;
}

// Description of the request parameters.
export interface QLRequestParam {
    type_name: string;
    value: string | string[];
}

export type QLResultEntryMetadataDataColumnOrGroup =
    | QLResultEntryMetadataDataGroup
    | QLResultEntryMetadataDataColumn;

interface QLEntryDataSharedConnection {
    entryId: string;
    type: string;
}

export interface QLQuery {
    value: string;
    hidden?: boolean;
    params: QLParam[];
}

export interface QLEntryDataShared {
    version: undefined;
    // The type of template used to generate a chart at the ChartsEngine level, a low-level thing
    type: string;

    // Chart type should be selected in UI
    chartType: QLChartType;
    queryValue: string;
    queries: QLQuery[];
    extraSettings?: CommonSharedExtraSettings;
    visualization: Shared['visualization'] & {highchartsId?: string};
    params: QLParam[];
    connection: QLEntryDataSharedConnection;
    order?: QLResultEntryMetadataDataColumnOrGroup[];
    preview?: boolean;

    colors?: Field[];
    colorsConfig?: any;
    labels?: Field[];
    tooltips?: Field[];
    shapes?: Field[];
    shapesConfig?: ShapesConfig;

    available?: Field[];
}

export interface QLPreviewTableDataColumn {
    name: string;
}

export interface QLPreviewTableDataRow {
    [key: string]: number | string | null;
}

export interface QLPreviewTableData {
    columns?: QLPreviewTableDataColumn[];
    data?: QLPreviewTableDataRow[];
}

export interface MonitoringPresetV1 {
    data: {
        v?: string;
        chart: {
            targets: {
                query: string;
                scopeId: string;
            }[];
            settings: {
                ['chart.type']: string;
                ['other.normalize']: string;
            };
        };
        redirectUrl?: string;
        params: {
            from: number;
            to: number;
        };
    };
    presetId: string;
}

export interface MonitoringPresetV2 {
    data: {
        v: 'v2';
        widget: {
            id: string;
            title: string;
            queries: {
                targets: {
                    name: string;
                    query: string;
                    hidden: boolean;
                    textMode: boolean;
                }[];
            };
            visualizationSettings: {
                type: string;
                title: string;
                normalize: boolean;
                showLabels: boolean;
                aggregation: string;
                interpolate: string;
                tilesSettings: {
                    showTitle: boolean;
                    showValue: boolean;
                    sortField: string;
                    sortOrder: string;
                };
                yaxisSettings: {
                    left: {
                        max: string;
                        min: string;
                        type: string;
                        title: string;
                        precision: number | null;
                        unitFormat: string;
                    };
                    right: {
                        max: string;
                        min: string;
                        type: string;
                        title: string;
                        precision: number | null;
                        unitFormat: string;
                    };
                };
                colorSchemeSettings: {
                    scheme: string;
                };
            };
        };
        redirectUrl: string;
        scopeId: string;
        params: {
            from: number;
            to: number;
        };
    };
    presetId: string;
}
