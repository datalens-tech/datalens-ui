import type {
    MonitoringPresetV1,
    MonitoringPresetV2,
    QLEntryDataShared,
    QLParam,
    QLParamInterval,
    QLPreviewTableData,
    QLPreviewTableDataColumn,
    QLPreviewTableDataRow,
    QLQuery,
    QLRequestParam,
    QLResultEntryMetadataDataColumn,
    QLResultEntryMetadataDataColumnOrGroup,
    QLResultEntryMetadataDataGroup,
} from '../../ql/common';

export type QlConfig = QLEntryDataShared;

export type QlExtendedConfig = QlConfig;

export type QLConfigQuery = QLQuery;

export type QlConfigResultEntryMetadataDataGroup = QLResultEntryMetadataDataGroup;

export type QlConfigResultEntryMetadataDataColumn = QLResultEntryMetadataDataColumn;

export type QlConfigParamInterval = QLParamInterval;

export type QlConfigParam = QLParam;

export type QlConfigRequestParam = QLRequestParam;

export type QlConfigResultEntryMetadataDataColumnOrGroup = QLResultEntryMetadataDataColumnOrGroup;

export type QlConfigPreviewTableDataColumn = QLPreviewTableDataColumn;

export type QlConfigPreviewTableDataRow = QLPreviewTableDataRow;

export type QlConfigPreviewTableData = QLPreviewTableData;

export type MonitoringPreset = MonitoringPresetV1 | MonitoringPresetV2;
