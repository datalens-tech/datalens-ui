import type {TransferNotification} from '../../../shared';

export const createTransferNotification = (
    level: TransferNotification['level'],
    code: TransferNotification['code'],
    details?: TransferNotification['details'],
) => ({
    code,
    level,
    ...(details ? {details} : {}),
});

export const infoTransferNotification = (
    code: TransferNotification['code'],
    details?: TransferNotification['details'],
) => createTransferNotification('info', code, details);

export const warningTransferNotification = (
    code: TransferNotification['code'],
    details?: TransferNotification['details'],
) => createTransferNotification('warning', code, details);

export const criticalTransferNotification = (
    code: TransferNotification['code'],
    details?: TransferNotification['details'],
) => createTransferNotification('critical', code, details);
