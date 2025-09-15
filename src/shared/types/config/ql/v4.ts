import type {QLChartType} from '../../../constants';
import type {QlConfigVersions} from '../../ql/versions';
import type {
    CommonSharedExtraSettings,
    Field,
    PointSizeConfig,
    ShapesConfig,
    Shared,
} from '../../wizard';

export interface QLResultEntryMetadataDataGroupV4 {
    group: boolean;
    undragable: boolean;
    name: string;
    capacity?: number;
    size: number;
    id?: string;
    allowedTypes?: string[];
    pseudo?: boolean;
}

export interface QLResultEntryMetadataDataColumnV4 {
    typeName: string;

    // biType -- a new type compatible with Field and general visualization section
    biType?: string;

    name: string;
    id?: string;
    undragable?: boolean;
    pseudo?: boolean;
}

export interface QLParamIntervalV4 {
    from: string | undefined;
    to: string | undefined;
}

export interface QLParamV4 {
    name: string;
    type: string;
    label: string;
    defaultValue: string | string[] | QLParamIntervalV4 | undefined;
    overridenValue?: string | string[] | QLParamIntervalV4;
}

// Description of the request parameters.
export interface QLRequestParamV4 {
    type_name: string;
    value: string | string[];
}

export type QLResultEntryMetadataDataColumnOrGroupV4 =
    | QLResultEntryMetadataDataGroupV4
    | QLResultEntryMetadataDataColumnV4;

interface QLEntryDataSharedConnectionV4 {
    entryId: string;
    type: string;
}

export interface QLQueryV4 {
    value: string;
    hidden?: boolean;
    params: QLParamV4[];
    queryName: string;
}

export interface QlConfigV4 {
    version: QlConfigVersions.V4;
    // The type of template used to generate a chart at the ChartsEngine level, a low-level thing
    type: string;

    // Chart type should be selected in UI
    chartType: QLChartType;
    queryValue: string;
    queries: QLQueryV4[];
    extraSettings?: CommonSharedExtraSettings;
    visualization: Shared['visualization'] & {highchartsId?: string};
    geopointsConfig?: PointSizeConfig;
    params: QLParamV4[];
    connection: QLEntryDataSharedConnectionV4;
    order?: QLResultEntryMetadataDataColumnOrGroupV4[] | null;
    preview?: boolean;

    colors: Field[];
    colorsConfig?: any;
    labels: Field[];
    tooltips: Field[];
    shapes: Field[];
    shapesConfig?: ShapesConfig;

    available?: Field[];
}

export interface QLPreviewTableDataColumnV4 {
    name: string;
}

export interface QLPreviewTableDataRowV4 {
    [key: string]: number | string | null;
}

export interface QLPreviewTableDataV4 {
    columns?: QLPreviewTableDataColumnV4[];
    data?: QLPreviewTableDataRowV4[];
}
