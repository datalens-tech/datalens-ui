import {EntryScope} from '..';

export const TRANSFER_UNKNOWN_ENTRY_ID = 'UNKNOWN_ENTRY';

export enum TransferErrorCode {
    TransferInvalidVersion = 'ERR.UI_API.TRANSFER_INVALID_VERSION',
    TransferMissingMappingId = 'ERR.UI_API.TRANSFER_MISSING_MAPPING_ID',
    TransferInvalidEntryData = 'ERR.UI_API.TRANSFER_INVALID_ENTRY_DATA',
    TransferInvalidEntryScope = 'ERR.UI_API.TRANSFER_INVALID_ENTRY_SCOPE',
    TransferInvalidToken = 'ERR.UI_API.TRANSFER_INVALID_TOKEN',
}

export const TransferCapabilities = {
    exportOrder: {
        [EntryScope.Connection]: 4,
        [EntryScope.Dataset]: 3,
        [EntryScope.Widget]: 2,
        [EntryScope.Dash]: 1,
    },
    importOrder: {
        [EntryScope.Connection]: 1,
        [EntryScope.Dataset]: 2,
        [EntryScope.Widget]: 3,
        [EntryScope.Dash]: 4,
    },
};
