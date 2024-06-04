import type {QLChartType} from '../../../constants';
import type {QlConfigVersions} from '../../ql/versions';
import type {CommonSharedExtraSettings, Field, ShapesConfig, Shared} from '../../wizard';

export interface QLResultEntryMetadataDataGroupV2 {
    group: boolean;
    undragable: boolean;
    name: string;
    capacity?: number;
    size: number;
    id?: string;
    allowedTypes?: string[];
    pseudo?: boolean;
}

export interface QLResultEntryMetadataDataColumnV2 {
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

export interface QLParamIntervalV2 {
    from: string | undefined;
    to: string | undefined;
}

export interface QLParamV2 {
    name: string;
    type: string;
    label: string;
    defaultValue: string | string[] | QLParamIntervalV2 | undefined;
    overridenValue?: string | string[] | QLParamIntervalV2;
}

// Description of the request parameters.
export interface QLRequestParamV2 {
    type_name: string;
    value: string | string[];
}

export type QLResultEntryMetadataDataColumnOrGroupV2 =
    | QLResultEntryMetadataDataGroupV2
    | QLResultEntryMetadataDataColumnV2;

interface QLEntryDataSharedConnectionV2 {
    entryId: string;
    type: string;
}

export interface QLQueryV2 {
    value: string;
    hidden?: boolean;
    params: QLParamV2[];
    queryName: string;
}

export interface QlConfigV2 {
    version: QlConfigVersions.V2;
    // The type of template used to generate a chart at the ChartsEngine level, a low-level thing
    type: string;

    // Chart type should be selected in UI
    chartType: QLChartType;
    queryValue: string;
    queries: QLQueryV2[];
    extraSettings?: CommonSharedExtraSettings;
    visualization: Shared['visualization'] & {highchartsId?: string};
    params: QLParamV2[];
    connection: QLEntryDataSharedConnectionV2;
    order?: QLResultEntryMetadataDataColumnOrGroupV2[] | null;
    preview?: boolean;

    colors?: Field[];
    colorsConfig?: any;
    labels?: Field[];
    tooltips?: Field[];
    shapes?: Field[];
    shapesConfig?: ShapesConfig;

    available?: Field[];
}

export interface QLPreviewTableDataColumnV2 {
    name: string;
}

export interface QLPreviewTableDataRowV2 {
    [key: string]: number | string | null;
}

export interface QLPreviewTableDataV2 {
    columns?: QLPreviewTableDataColumnV2[];
    data?: QLPreviewTableDataRowV2[];
}
