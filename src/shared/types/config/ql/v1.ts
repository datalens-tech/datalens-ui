import type {QLChartType} from '../../../constants';
import type {QlConfigVersions} from '../../ql/versions';
import type {CommonSharedExtraSettings, Field, ShapesConfig, Shared} from '../../wizard';

export interface QLResultEntryMetadataDataGroupV1 {
    group: boolean;
    undragable: boolean;
    name: string;
    capacity?: number;
    size: number;
    id?: string;
    allowedTypes?: string[];
    pseudo?: boolean;
}

export interface QLResultEntryMetadataDataColumnV1 {
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

export interface QLParamIntervalV1 {
    from: string | undefined;
    to: string | undefined;
}

export interface QLParamV1 {
    name: string;
    type: string;
    defaultValue: string | string[] | QLParamIntervalV1 | undefined;
    overridenValue?: string | string[] | QLParamIntervalV1;
}

// Description of the request parameters.
export interface QLRequestParamV1 {
    type_name: string;
    value: string | string[];
}

export type QLResultEntryMetadataDataColumnOrGroupV1 =
    | QLResultEntryMetadataDataGroupV1
    | QLResultEntryMetadataDataColumnV1;

interface QLEntryDataSharedConnectionV1 {
    entryId: string;
    type: string;
}

export interface QLQueryV1 {
    value: string;
    hidden?: boolean;
    params: QLParamV1[];
}

export interface QlConfigV1 {
    version: QlConfigVersions.V1;
    // The type of template used to generate a chart at the ChartsEngine level, a low-level thing
    type: string;

    // Chart type should be selected in UI
    chartType: QLChartType;
    queryValue: string;
    queries: QLQueryV1[];
    extraSettings?: CommonSharedExtraSettings;
    visualization: Shared['visualization'] & {highchartsId?: string};
    params: QLParamV1[];
    connection: QLEntryDataSharedConnectionV1;
    order?: QLResultEntryMetadataDataColumnOrGroupV1[];
    preview?: boolean;

    colors?: Field[];
    colorsConfig?: any;
    labels?: Field[];
    tooltips?: Field[];
    shapes?: Field[];
    shapesConfig?: ShapesConfig;

    available?: Field[];
}

export interface QLPreviewTableDataColumnV1 {
    name: string;
}

export interface QLPreviewTableDataRowV1 {
    [key: string]: number | string | null;
}

export interface QLPreviewTableDataV1 {
    columns?: QLPreviewTableDataColumnV1[];
    data?: QLPreviewTableDataRowV1[];
}
