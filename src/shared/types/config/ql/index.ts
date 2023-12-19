import type {MonitoringPresetV1, MonitoringPresetV2, QLEntryDataShared} from '../../ql/common';

import {QlConfigV1} from './v1';
import {QlConfigV2} from './v2';
import {
    QLParamIntervalV3,
    QLParamV3,
    QLPreviewTableDataColumnV3,
    QLPreviewTableDataRowV3,
    QLPreviewTableDataV3,
    QLQueryV3,
    QLRequestParamV3,
    QLResultEntryMetadataDataColumnOrGroupV3,
    QLResultEntryMetadataDataColumnV3,
    QLResultEntryMetadataDataGroupV3,
    QlConfigV3,
} from './v3';

export type QlConfig = QlConfigV3;

export type QlPreviousConfig = QLEntryDataShared | QlConfigV2 | QlConfigV1;

export type QlExtendedConfig = QlConfig | QlPreviousConfig;

export type QLConfigQuery = QLQueryV3;

export type QlConfigResultEntryMetadataDataGroup = QLResultEntryMetadataDataGroupV3;

export type QlConfigResultEntryMetadataDataColumn = QLResultEntryMetadataDataColumnV3;

export type QlConfigParamInterval = QLParamIntervalV3;

export type QlConfigParam = QLParamV3;

export type QlConfigRequestParam = QLRequestParamV3;

export type QlConfigResultEntryMetadataDataColumnOrGroup = QLResultEntryMetadataDataColumnOrGroupV3;

export type QlConfigPreviewTableDataColumn = QLPreviewTableDataColumnV3;

export type QlConfigPreviewTableDataRow = QLPreviewTableDataRowV3;

export type QlConfigPreviewTableData = QLPreviewTableDataV3;

export type MonitoringPreset = MonitoringPresetV1 | MonitoringPresetV2;
