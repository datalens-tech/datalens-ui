import type {MonitoringPresetV1, MonitoringPresetV2, QLEntryDataShared} from '../../ql/common';

import type {QlConfigV1} from './v1';
import type {QlConfigV2} from './v2';
import type {QlConfigV3} from './v3';
import type {QlConfigV4} from './v4';
import type {QlConfigV5} from './v5';
import type {QlConfigV6} from './v6';
import type {
    QLParamIntervalV7,
    QLParamV7,
    QLPreviewTableDataColumnV7,
    QLPreviewTableDataRowV7,
    QLPreviewTableDataV7,
    QLQueryV7,
    QLRequestParamV7,
    QLResultEntryMetadataDataColumnOrGroupV7,
    QLResultEntryMetadataDataColumnV7,
    QLResultEntryMetadataDataGroupV7,
    QlConfigV7,
} from './v7';

export type QlConfig = QlConfigV7;

export type QlPreviousConfig =
    | QLEntryDataShared
    | QlConfigV6
    | QlConfigV5
    | QlConfigV4
    | QlConfigV3
    | QlConfigV2
    | QlConfigV1;

export type QlExtendedConfig = QlConfig | QlPreviousConfig;

export type QLConfigQuery = QLQueryV7;

export type QlConfigResultEntryMetadataDataGroup = QLResultEntryMetadataDataGroupV7;

export type QlConfigResultEntryMetadataDataColumn = QLResultEntryMetadataDataColumnV7;

export type QlConfigParamInterval = QLParamIntervalV7;

export type QlConfigParam = QLParamV7;

export type QlConfigRequestParam = QLRequestParamV7;

export type QlConfigResultEntryMetadataDataColumnOrGroup = QLResultEntryMetadataDataColumnOrGroupV7;

export type QlConfigPreviewTableDataColumn = QLPreviewTableDataColumnV7;

export type QlConfigPreviewTableDataRow = QLPreviewTableDataRowV7;

export type QlConfigPreviewTableData = QLPreviewTableDataV7;

export type MonitoringPreset = MonitoringPresetV1 | MonitoringPresetV2;
