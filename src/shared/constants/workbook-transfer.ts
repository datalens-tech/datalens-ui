export const TRANSFER_UNKNOWN_ENTRY_ID = 'UNKNOWN_ENTRY';

export enum TransferErrorCode {
    TransferInvalidVersion = 'ERR.UI_API.TRANSFER_INVALID_VERSION',
    TransferMissingMappingId = 'ERR.UI_API.TRANSFER_MISSING_MAPPING_ID',
    TransferInvalidEntryData = 'ERR.UI_API.TRANSFER_INVALID_ENTRY_DATA',
    TransferInvalidEntryScope = 'ERR.UI_API.TRANSFER_INVALID_ENTRY_SCOPE',
    TransferInvalidToken = 'ERR.UI_API.TRANSFER_INVALID_TOKEN',
}
