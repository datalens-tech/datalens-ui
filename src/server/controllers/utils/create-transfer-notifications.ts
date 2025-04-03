import type {TransferNotification} from '../../../shared';

export const createTransferNotification = (
    level: TransferNotification['level'],
    message: TransferNotification['message'],
    code?: TransferNotification['code'],
) => ({
    ...(code ? {code} : {}),
    message,
    level,
});

export const infoTransferNotification = (
    message: TransferNotification['message'],
    code?: TransferNotification['code'],
) => createTransferNotification('info', message, code);

export const warningTransferNotification = (
    message: TransferNotification['message'],
    code?: TransferNotification['code'],
) => createTransferNotification('warning', message, code);

export const criticalTransferNotification = (
    message: TransferNotification['message'],
    code?: TransferNotification['code'],
) => createTransferNotification('critical', message, code);
