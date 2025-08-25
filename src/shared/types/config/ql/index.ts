import type {MonitoringPresetV1, MonitoringPresetV2, QLEntryDataShared} from '../../ql/common';

import type {QlConfigV1} from './v1';
import type {QlConfigV2} from './v2';
import type {QlConfigV3} from './v3';
import type {QlConfigV4} from './v4';
import type {QlConfigV5} from './v5';
import type {
    QLParamIntervalV6,
    QLParamV6,
    QLPreviewTableDataColumnV6,
    QLPreviewTableDataRowV6,
    QLPreviewTableDataV6,
    QLQueryV6,
    QLRequestParamV6,
    QLResultEntryMetadataDataColumnOrGroupV6,
    QLResultEntryMetadataDataColumnV6,
    QLResultEntryMetadataDataGroupV6,
    QlConfigV6,
} from './v6';

export type QlConfig = QlConfigV6;

export type QlPreviousConfig =
    | QLEntryDataShared
    | QlConfigV5
    | QlConfigV4
    | QlConfigV3
    | QlConfigV2
    | QlConfigV1;

export type QlExtendedConfig = QlConfig | QlPreviousConfig;

export type QLConfigQuery = QLQueryV6;

export type QlConfigResultEntryMetadataDataGroup = QLResultEntryMetadataDataGroupV6;

export type QlConfigResultEntryMetadataDataColumn = QLResultEntryMetadataDataColumnV6;

export type QlConfigParamInterval = QLParamIntervalV6;

export type QlConfigParam = QLParamV6;

export type QlConfigRequestParam = QLRequestParamV6;

export type QlConfigResultEntryMetadataDataColumnOrGroup = QLResultEntryMetadataDataColumnOrGroupV6;

export type QlConfigPreviewTableDataColumn = QLPreviewTableDataColumnV6;

export type QlConfigPreviewTableDataRow = QLPreviewTableDataRowV6;

export type QlConfigPreviewTableData = QLPreviewTableDataV6;

export type MonitoringPreset = MonitoringPresetV1 | MonitoringPresetV2;
