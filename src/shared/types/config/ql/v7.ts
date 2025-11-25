import type {QLChartType} from '../../../constants';
import type {TableHead, TableRow} from '../../chartkit';
import type {QlConfigVersions} from '../../ql/versions';
import type {
    CommonSharedExtraSettings,
    Field,
    PointSizeConfig,
    ShapesConfig,
    Shared,
} from '../../wizard';

export interface QLResultEntryMetadataDataGroupV7 {
    group: boolean;
    undragable: boolean;
    name: string;
    capacity?: number;
    size: number;
    id?: string;
    allowedTypes?: string[];
    pseudo?: boolean;
}

export interface QLResultEntryMetadataDataColumnV7 {
    typeName: string;

    // biType -- a new type compatible with Field and general visualization section
    biType?: string;

    name: string;
    id?: string;
    undragable?: boolean;
    pseudo?: boolean;
}

export interface QLParamIntervalV7 {
    from: string | undefined;
    to: string | undefined;
}

export interface QLParamV7 {
    name: string;
    type: string;
    defaultValue: string | string[] | QLParamIntervalV7 | undefined;
    overridenValue?: string | string[] | QLParamIntervalV7;
}

// Description of the request parameters.
export interface QLRequestParamV7 {
    type_name: string;
    value: string | string[];
}

export type QLResultEntryMetadataDataColumnOrGroupV7 =
    | QLResultEntryMetadataDataGroupV7
    | QLResultEntryMetadataDataColumnV7;

interface QLEntryDataSharedConnectionV7 {
    entryId: string;
    type: string;
    dataExportForbidden?: boolean;
}

export interface QLQueryV7 {
    value: string;
    hidden?: boolean;
    params: QLParamV7[];
    queryName: string;
}

export interface QlConfigV7 {
    version: QlConfigVersions.V7;
    // The type of template used to generate a chart at the ChartsEngine level, a low-level thing
    type: string;

    // Chart type should be selected in UI
    chartType: QLChartType;
    queryValue: string;
    queries: QLQueryV7[];
    extraSettings?: CommonSharedExtraSettings;
    visualization: Shared['visualization'] & {highchartsId?: string};
    geopointsConfig?: PointSizeConfig;
    params: QLParamV7[];
    connection: QLEntryDataSharedConnectionV7;
    order?: QLResultEntryMetadataDataColumnOrGroupV7[] | null;
    preview?: boolean;

    colors: Field[];
    colorsConfig?: any;
    labels: Field[];
    tooltips: Field[];
    shapes: Field[];
    shapesConfig?: ShapesConfig;

    available?: Field[];
}

export interface QLPreviewTableDataColumnV7 {}

export interface QLPreviewTableDataRowV7 {}

export interface QLPreviewTableDataV7 {
    columns?: Array<QLPreviewTableDataColumnV7 & TableHead>;
    data?: Array<QLPreviewTableDataRowV7 & TableRow>;
}
