import type {MonitoringPresetV1, MonitoringPresetV2, QLEntryDataShared} from '../../ql/common';

import type {QlConfigV1} from './v1';
import type {QlConfigV2} from './v2';
import type {QlConfigV3} from './v3';
import type {
    QLParamIntervalV4,
    QLParamV4,
    QLPreviewTableDataColumnV4,
    QLPreviewTableDataRowV4,
    QLPreviewTableDataV4,
    QLQueryV4,
    QLRequestParamV4,
    QLResultEntryMetadataDataColumnOrGroupV4,
    QLResultEntryMetadataDataColumnV4,
    QLResultEntryMetadataDataGroupV4,
    QlConfigV4,
} from './v4';

export type QlConfig = QlConfigV4;

export type QlPreviousConfig = QLEntryDataShared | QlConfigV3 | QlConfigV2 | QlConfigV1;

export type QlExtendedConfig = QlConfig | QlPreviousConfig;

export type QLConfigQuery = QLQueryV4;

export type QlConfigResultEntryMetadataDataGroup = QLResultEntryMetadataDataGroupV4;

export type QlConfigResultEntryMetadataDataColumn = QLResultEntryMetadataDataColumnV4;

export type QlConfigParamInterval = QLParamIntervalV4;

export type QlConfigParam = QLParamV4;

export type QlConfigRequestParam = QLRequestParamV4;

export type QlConfigResultEntryMetadataDataColumnOrGroup = QLResultEntryMetadataDataColumnOrGroupV4;

export type QlConfigPreviewTableDataColumn = QLPreviewTableDataColumnV4;

export type QlConfigPreviewTableDataRow = QLPreviewTableDataRowV4;

export type QlConfigPreviewTableData = QLPreviewTableDataV4;

export type MonitoringPreset = MonitoringPresetV1 | MonitoringPresetV2;
