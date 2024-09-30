import update from 'immutability-helper';
import type {EntryScope} from 'shared';
import {ITEM_TYPE} from 'ui/constants/dialogs';
import type {CopiedConfigData} from 'ui/units/dash/modules/helpers';

export const migrateItemDataOnPaste = ({
    itemData,
}: {
    itemData: CopiedConfigData;
    toScope: EntryScope;
}) => {
    const migratedItemData = {
        ...itemData,
        data: update(itemData.data, {$unset: ['id']}),
    };

    if (itemData.type === ITEM_TYPE.WIDGET) {
        migratedItemData.data.tabs =
            itemData.data.tabs &&
            itemData.data.tabs.map((tab) => {
                return update(tab, {
                    $unset: ['id'],
                });
            });
    }

    if (itemData.type === ITEM_TYPE.GROUP_CONTROL) {
        migratedItemData.data.group = itemData.data.group?.map((item) => {
            return update(item, {$unset: ['id']});
        });
    }

    return migratedItemData;
};
