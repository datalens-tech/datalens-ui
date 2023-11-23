import type {MonitoringPresetV1, MonitoringPresetV2, QLEntryDataShared} from '../../ql/common';

import {QlConfigV1} from './v1';
import {
    QLParamIntervalV2,
    QLParamV2,
    QLPreviewTableDataColumnV2,
    QLPreviewTableDataRowV2,
    QLPreviewTableDataV2,
    QLQueryV2,
    QLRequestParamV2,
    QLResultEntryMetadataDataColumnOrGroupV2,
    QLResultEntryMetadataDataColumnV2,
    QLResultEntryMetadataDataGroupV2,
    QlConfigV2,
} from './v2';

export type QlConfig = QlConfigV2;

export type QlPreviousConfig = QLEntryDataShared | QlConfigV1;

export type QlExtendedConfig = QlConfig | QlPreviousConfig;

export type QLConfigQuery = QLQueryV2;

export type QlConfigResultEntryMetadataDataGroup = QLResultEntryMetadataDataGroupV2;

export type QlConfigResultEntryMetadataDataColumn = QLResultEntryMetadataDataColumnV2;

export type QlConfigParamInterval = QLParamIntervalV2;

export type QlConfigParam = QLParamV2;

export type QlConfigRequestParam = QLRequestParamV2;

export type QlConfigResultEntryMetadataDataColumnOrGroup = QLResultEntryMetadataDataColumnOrGroupV2;

export type QlConfigPreviewTableDataColumn = QLPreviewTableDataColumnV2;

export type QlConfigPreviewTableDataRow = QLPreviewTableDataRowV2;

export type QlConfigPreviewTableData = QLPreviewTableDataV2;

export type MonitoringPreset = MonitoringPresetV1 | MonitoringPresetV2;
