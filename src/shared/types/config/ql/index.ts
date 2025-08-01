import type {MonitoringPresetV1, MonitoringPresetV2, QLEntryDataShared} from '../../ql/common';

import type {QlConfigV1} from './v1';
import type {QlConfigV2} from './v2';
import type {QlConfigV3} from './v3';
import type {QlConfigV4} from './v4';
import type {
    QLParamIntervalV5,
    QLParamV5,
    QLPreviewTableDataColumnV5,
    QLPreviewTableDataRowV5,
    QLPreviewTableDataV5,
    QLQueryV5,
    QLRequestParamV5,
    QLResultEntryMetadataDataColumnOrGroupV5,
    QLResultEntryMetadataDataColumnV5,
    QLResultEntryMetadataDataGroupV5,
    QlConfigV5,
} from './v5';

export type QlConfig = QlConfigV5;

export type QlPreviousConfig =
    | QLEntryDataShared
    | QlConfigV4
    | QlConfigV3
    | QlConfigV2
    | QlConfigV1;

export type QlExtendedConfig = QlConfig | QlPreviousConfig;

export type QLConfigQuery = QLQueryV5;

export type QlConfigResultEntryMetadataDataGroup = QLResultEntryMetadataDataGroupV5;

export type QlConfigResultEntryMetadataDataColumn = QLResultEntryMetadataDataColumnV5;

export type QlConfigParamInterval = QLParamIntervalV5;

export type QlConfigParam = QLParamV5;

export type QlConfigRequestParam = QLRequestParamV5;

export type QlConfigResultEntryMetadataDataColumnOrGroup = QLResultEntryMetadataDataColumnOrGroupV5;

export type QlConfigPreviewTableDataColumn = QLPreviewTableDataColumnV5;

export type QlConfigPreviewTableDataRow = QLPreviewTableDataRowV5;

export type QlConfigPreviewTableData = QLPreviewTableDataV5;

export type MonitoringPreset = MonitoringPresetV1 | MonitoringPresetV2;
