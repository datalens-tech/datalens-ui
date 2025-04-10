import type {TransferNotification} from '../../../shared';

export const createTransferNotification = (
    level: TransferNotification['level'],
    code: TransferNotification['code'],
    message?: TransferNotification['message'],
) => ({
    code,
    level,
    ...(message ? {message} : {}),
});

export const infoTransferNotification = (
    code: TransferNotification['code'],
    message?: TransferNotification['message'],
) => createTransferNotification('info', code, message);

export const warningTransferNotification = (
    code: TransferNotification['code'],
    message?: TransferNotification['message'],
) => createTransferNotification('warning', code, message);

export const criticalTransferNotification = (
    code: TransferNotification['code'],
    message?: TransferNotification['message'],
) => createTransferNotification('critical', code, message);
