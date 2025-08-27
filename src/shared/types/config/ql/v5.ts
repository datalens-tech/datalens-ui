import type {QLChartType} from '../../../constants';
import type {QlConfigVersions} from '../../ql/versions';
import type {
    CommonSharedExtraSettings,
    Field,
    PointSizeConfig,
    ShapesConfig,
    Shared,
} from '../../wizard';

export interface QLResultEntryMetadataDataGroupV5 {
    group: boolean;
    undragable: boolean;
    name: string;
    capacity?: number;
    size: number;
    id?: string;
    allowedTypes?: string[];
    pseudo?: boolean;
}

export interface QLResultEntryMetadataDataColumnV5 {
    typeName: string;

    // biType -- a new type compatible with Field and general visualization section
    biType?: string;

    name: string;
    id?: string;
    undragable?: boolean;
    pseudo?: boolean;
}

export interface QLParamIntervalV5 {
    from: string | undefined;
    to: string | undefined;
}

export interface QLParamV5 {
    name: string;
    type: string;
    defaultValue: string | string[] | QLParamIntervalV5 | undefined;
    overridenValue?: string | string[] | QLParamIntervalV5;
}

// Description of the request parameters.
export interface QLRequestParamV5 {
    type_name: string;
    value: string | string[];
}

export type QLResultEntryMetadataDataColumnOrGroupV5 =
    | QLResultEntryMetadataDataGroupV5
    | QLResultEntryMetadataDataColumnV5;

interface QLEntryDataSharedConnectionV5 {
    entryId: string;
    type: string;
}

export interface QLQueryV5 {
    value: string;
    hidden?: boolean;
    params: QLParamV5[];
    queryName: string;
}

export interface QlConfigV5 {
    version: QlConfigVersions.V5;
    // The type of template used to generate a chart at the ChartsEngine level, a low-level thing
    type: string;

    // Chart type should be selected in UI
    chartType: QLChartType;
    queryValue: string;
    queries: QLQueryV5[];
    extraSettings?: CommonSharedExtraSettings;
    visualization: Shared['visualization'] & {highchartsId?: string};
    geopointsConfig?: PointSizeConfig;
    params: QLParamV5[];
    connection: QLEntryDataSharedConnectionV5;
    order?: QLResultEntryMetadataDataColumnOrGroupV5[] | null;
    preview?: boolean;

    colors: Field[];
    colorsConfig?: any;
    labels: Field[];
    tooltips: Field[];
    shapes: Field[];
    shapesConfig?: ShapesConfig;

    available?: Field[];
}

export interface QLPreviewTableDataColumnV5 {
    name: string;
}

export interface QLPreviewTableDataRowV5 {
    [key: string]: number | string | null;
}

export interface QLPreviewTableDataV5 {
    columns?: QLPreviewTableDataColumnV5[];
    data?: QLPreviewTableDataRowV5[];
}
