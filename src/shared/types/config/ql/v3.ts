import type {QLChartType} from '../../../constants';
import type {QlConfigVersions} from '../../ql/versions';
import type {CommonSharedExtraSettings, Field, ShapesConfig, Shared} from '../../wizard';

export interface QLResultEntryMetadataDataGroupV3 {
    group: boolean;
    undragable: boolean;
    name: string;
    capacity?: number;
    size: number;
    id?: string;
    allowedTypes?: string[];
    pseudo?: boolean;
}

export interface QLResultEntryMetadataDataColumnV3 {
    typeName: string;

    // biType -- a new type compatible with Field and general visualization section
    biType?: string;

    name: string;
    id?: string;
    undragable?: boolean;
    pseudo?: boolean;
}

export interface QLParamIntervalV3 {
    from: string | undefined;
    to: string | undefined;
}

export interface QLParamV3 {
    name: string;
    type: string;
    defaultValue: string | string[] | QLParamIntervalV3 | undefined;
    overridenValue?: string | string[] | QLParamIntervalV3;
}

// Description of the request parameters.
export interface QLRequestParamV3 {
    type_name: string;
    value: string | string[];
}

export type QLResultEntryMetadataDataColumnOrGroupV3 =
    | QLResultEntryMetadataDataGroupV3
    | QLResultEntryMetadataDataColumnV3;

interface QLEntryDataSharedConnectionV3 {
    entryId: string;
    type: string;
}

export interface QLQueryV3 {
    value: string;
    hidden?: boolean;
    params: QLParamV3[];
    queryName: string;
}

export interface QlConfigV3 {
    version: QlConfigVersions.V3;
    // The type of template used to generate a chart at the ChartsEngine level, a low-level thing
    type: string;

    // Chart type should be selected in UI
    chartType: QLChartType;
    queryValue: string;
    queries: QLQueryV3[];
    extraSettings?: CommonSharedExtraSettings;
    visualization: Shared['visualization'] & {highchartsId?: string};
    params: QLParamV3[];
    connection: QLEntryDataSharedConnectionV3;
    order?: QLResultEntryMetadataDataColumnOrGroupV3[] | null;
    preview?: boolean;

    colors: Field[];
    colorsConfig?: any;
    labels: Field[];
    tooltips: Field[];
    shapes: Field[];
    shapesConfig?: ShapesConfig;

    available?: Field[];
}

export interface QLPreviewTableDataColumnV3 {
    name: string;
}

export interface QLPreviewTableDataRowV3 {
    [key: string]: number | string | null;
}

export interface QLPreviewTableDataV3 {
    columns?: QLPreviewTableDataColumnV3[];
    data?: QLPreviewTableDataRowV3[];
}
