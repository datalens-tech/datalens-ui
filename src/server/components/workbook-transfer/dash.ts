import {
    type DashEntry,
    EntryScope,
    EntryUpdateMode,
    ErrorCode,
    type TransferIdMapping,
    type TransferNotification,
} from '../../../shared';
import Dash from '../sdk/dash';

import {
    criticalTransferNotification,
    warningTransferNotification,
} from './create-transfer-notifications';

export async function prepareDashImportData(
    entryData: {data: DashEntry['data']; name: string},
    idMapping: TransferIdMapping,
) {
    const data = await Dash.migrate(entryData.data);
    const notifications: TransferNotification[] = [];
    const defaults = {
        name: entryData.name,
        scope: EntryScope.Dash,
        mode: EntryUpdateMode.Publish,
        links: {},
        type: '',
        key: '',
    };

    try {
        let isMissingMapping = false;

        Dash.processLinks(data, (value, obj, key) => {
            if (idMapping[value]) {
                obj[key] = idMapping[value];
                return idMapping[value];
            } else {
                isMissingMapping = true;
            }

            return value;
        });

        if (isMissingMapping) {
            notifications.push(warningTransferNotification(ErrorCode.TransferMissingMappingId));
        }

        Dash.validateData(data);
    } catch (err) {
        return {
            dash: null,
            notifications: [criticalTransferNotification(ErrorCode.TransferInvalidEntryData)],
        };
    }

    const links = Dash.gatherLinks(data);

    return {
        dash: {
            ...defaults,
            data,
            links,
        },
        notifications,
    };
}

export async function prepareDashExportData(entry: DashEntry, idMapping: TransferIdMapping) {
    const data = await Dash.migrate(entry.data);
    const notifications: TransferNotification[] = [];
    let isMissingMapping = false;

    Dash.processLinks(data, (value, obj, key) => {
        if (idMapping[value]) {
            obj[key] = idMapping[value];
            return idMapping[value];
        } else {
            isMissingMapping = true;
        }

        return value;
    });

    if (isMissingMapping) {
        notifications.push(warningTransferNotification(ErrorCode.TransferMissingMappingId));
    }

    const nameParts = entry.key.split('/');
    const name = nameParts[nameParts.length - 1];

    const dash = {
        name,
        data,
    };

    return {
        dash,
        notifications,
    };
}
