import type {FileSourceInfo} from '../../../../../../shared/schema';

import type {DialogS3SourceItem} from './types';

export const isAllActiveItemsSelected = (items: DialogS3SourceItem[]) => {
    return items.every(({disabled, selected}) => disabled || selected);
};

export const getListItems = (args: {
    sourcesInfo: FileSourceInfo[];
    selectedItems: string[];
    limit: number;
}): DialogS3SourceItem[] => {
    const {sourcesInfo, selectedItems, limit} = args;

    return sourcesInfo.map((item) => {
        const exeedsLimit = sourcesInfo.length > limit;
        const selected = selectedItems.includes(item.source_id);
        const disabled =
            !item.is_applicable || (exeedsLimit && !selected && selectedItems.length === limit);
        const listItem = {...item, selected, disabled};

        return listItem;
    });
};

export const getNextSelectedItems = (args: {
    items: DialogS3SourceItem[];
    selectedItems: string[];
    limit: number;
}) => {
    const {items, selectedItems, limit} = args;
    const exeedsLimit = items.length > limit;
    const allActiveItemsSelected = isAllActiveItemsSelected(items);
    let nextSelectedItems: string[];

    if (exeedsLimit && selectedItems.length === limit) {
        nextSelectedItems = [];
    } else if (exeedsLimit) {
        let selectedItemsCount = selectedItems.length;
        nextSelectedItems = [...selectedItems];

        for (let i = 0; i < items.length; i++) {
            if (items[i].disabled) {
                continue;
            }

            const id = items[i].source_id;
            const alreadySelected = selectedItems.includes(id);

            if (!alreadySelected) {
                nextSelectedItems.push(id);
                selectedItemsCount += 1;
            }

            if (selectedItemsCount === limit) {
                break;
            }
        }
    } else {
        nextSelectedItems = allActiveItemsSelected
            ? []
            : items.filter((item) => !item.disabled).map((item) => item.source_id);
    }

    return nextSelectedItems;
};
