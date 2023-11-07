import type {MonitoringPresetV1, MonitoringPresetV2, QLEntryDataShared} from '../../ql/common';

import {
    QLParamIntervalV1,
    QLParamV1,
    QLPreviewTableDataColumnV1,
    QLPreviewTableDataRowV1,
    QLPreviewTableDataV1,
    QLQueryV1,
    QLRequestParamV1,
    QLResultEntryMetadataDataColumnOrGroupV1,
    QLResultEntryMetadataDataColumnV1,
    QLResultEntryMetadataDataGroupV1,
    QlConfigV1,
} from './v1';

export type QlConfig = QlConfigV1;

export type QlPreviousConfig = QLEntryDataShared;

export type QlExtendedConfig = QlConfig;

export type QLConfigQuery = QLQueryV1;

export type QlConfigResultEntryMetadataDataGroup = QLResultEntryMetadataDataGroupV1;

export type QlConfigResultEntryMetadataDataColumn = QLResultEntryMetadataDataColumnV1;

export type QlConfigParamInterval = QLParamIntervalV1;

export type QlConfigParam = QLParamV1;

export type QlConfigRequestParam = QLRequestParamV1;

export type QlConfigResultEntryMetadataDataColumnOrGroup = QLResultEntryMetadataDataColumnOrGroupV1;

export type QlConfigPreviewTableDataColumn = QLPreviewTableDataColumnV1;

export type QlConfigPreviewTableDataRow = QLPreviewTableDataRowV1;

export type QlConfigPreviewTableData = QLPreviewTableDataV1;

export type MonitoringPreset = MonitoringPresetV1 | MonitoringPresetV2;
