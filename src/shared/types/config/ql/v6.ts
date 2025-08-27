import type {QLChartType} from '../../../constants';
import type {QlConfigVersions} from '../../ql/versions';
import type {
    CommonSharedExtraSettings,
    Field,
    PointSizeConfig,
    ShapesConfig,
    Shared,
} from '../../wizard';
import {TableHead, TableRow} from '../../chartkit';

export interface QLResultEntryMetadataDataGroupV6 {
    group: boolean;
    undragable: boolean;
    name: string;
    capacity?: number;
    size: number;
    id?: string;
    allowedTypes?: string[];
    pseudo?: boolean;
}

export interface QLResultEntryMetadataDataColumnV6 {
    typeName: string;

    // biType -- a new type compatible with Field and general visualization section
    biType?: string;

    name: string;
    id?: string;
    undragable?: boolean;
    pseudo?: boolean;
}

export interface QLParamIntervalV6 {
    from: string | undefined;
    to: string | undefined;
}

export interface QLParamV6 {
    name: string;
    type: string;
    defaultValue: string | string[] | QLParamIntervalV6 | undefined;
    overridenValue?: string | string[] | QLParamIntervalV6;
}

// Description of the request parameters.
export interface QLRequestParamV6 {
    type_name: string;
    value: string | string[];
}

export type QLResultEntryMetadataDataColumnOrGroupV6 =
    | QLResultEntryMetadataDataGroupV6
    | QLResultEntryMetadataDataColumnV6;

interface QLEntryDataSharedConnectionV6 {
    entryId: string;
    type: string;
}

export interface QLQueryV6 {
    value: string;
    hidden?: boolean;
    params: QLParamV6[];
    queryName: string;
}

export interface QlConfigV6 {
    version: QlConfigVersions.V6;
    // The type of template used to generate a chart at the ChartsEngine level, a low-level thing
    type: string;

    // Chart type should be selected in UI
    chartType: QLChartType;
    queryValue: string;
    queries: QLQueryV6[];
    extraSettings?: CommonSharedExtraSettings;
    visualization: Shared['visualization'] & {highchartsId?: string};
    geopointsConfig?: PointSizeConfig;
    params: QLParamV6[];
    connection: QLEntryDataSharedConnectionV6;
    order?: QLResultEntryMetadataDataColumnOrGroupV6[] | null;
    preview?: boolean;

    colors: Field[];
    colorsConfig?: any;
    labels: Field[];
    tooltips: Field[];
    shapes: Field[];
    shapesConfig?: ShapesConfig;

    available?: Field[];
}

export interface QLPreviewTableDataColumnV6 {}

export interface QLPreviewTableDataRowV6 {}

export interface QLPreviewTableDataV6 {
    columns?: Array<QLPreviewTableDataColumnV6 & TableHead>;
    data?: Array<QLPreviewTableDataRowV6 & TableRow>;
}
