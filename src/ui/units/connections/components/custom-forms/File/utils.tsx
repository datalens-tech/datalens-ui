import React from 'react';

import type {Column} from '@gravity-ui/react-data-table';
import type {ListItemData, ListProps} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {flow, get} from 'lodash';
import {Feature} from 'shared';
import type {DATASET_FIELD_TYPES, NonNullableBy} from 'shared';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import type {DataLensApiError} from '../../../../../typings';
import type {FileSourceItem, ListItemProps} from '../../../store';

import {TypeSelect} from './components/Workspace/TypeSelect';
import type {FileListItem, HandleFileSourceUpdate} from './types';

const i18n = I18n.keyset('connections.file.view');
const ITEM_HEIGHT = 52;
const GROUP_TITLE_HEIGHT = 38;
const ACCEPTED_EXTENTIONS = '.csv,.txt';

const isTitleMatchedByFilter = (title: string, filter: string) => {
    const lowerTitle = title.toLocaleLowerCase();
    const lowerFilter = filter.toLocaleLowerCase();

    return Boolean(lowerTitle.match(lowerFilter));
};

const isStandaloneSource = (item?: FileListItem) => {
    return Boolean(item && 'id' in item && 'raw_schema' in item);
};

export const isItemsMustBeGrouped = (items: ListItemProps[]) => {
    let hasCreatingSource = false;
    let hasStandaloneSource = false;

    items.forEach((item) => {
        const standaloneSource = isStandaloneSource(item);

        if (!hasCreatingSource) {
            hasCreatingSource = !standaloneSource;
        }

        if (!hasStandaloneSource) {
            hasStandaloneSource = standaloneSource;
        }
    });

    return hasCreatingSource && hasStandaloneSource;
};

const getSelectUpdateHandler = (
    handleFileSourceUpdate: HandleFileSourceUpdate,
    item: FileSourceItem,
    name: string,
) => {
    return (type: DATASET_FIELD_TYPES) => {
        handleFileSourceUpdate(item.file_id, item.source.source_id, [{name, user_type: type}]);
    };
};

const getSortedListItems = (items: ListItemProps[]) => {
    const sortedItems = [...items];

    sortedItems.sort((item1, item2) => {
        const item1IsStandalone = isStandaloneSource(item1);
        const item2IsStandalone = isStandaloneSource(item2);

        if (!item1IsStandalone && item2IsStandalone) {
            return -1;
        }

        if (item1IsStandalone && !item2IsStandalone) {
            return 1;
        }

        return 0;
    });

    return sortedItems;
};

const getGroupedListItems = (sortedItems: ListItemProps[]) => {
    const groupedItems: FileListItem[] = [];

    sortedItems.forEach((item, index) => {
        const prevItem = sortedItems[index - 1];
        const isPrevItemStandaloneSource = isStandaloneSource(prevItem);
        const isCurItemStandaloneSource = isStandaloneSource(item);

        if (index === 0) {
            groupedItems.push({
                groupTitle: i18n('label_new-files'),
                disabled: true,
            });
        } else if (!isPrevItemStandaloneSource && isCurItemStandaloneSource) {
            groupedItems.push({
                groupTitle: i18n('label_downloaded-files'),
                disabled: true,
                withBorder: true,
            });
        }

        groupedItems.push(item);
    });

    return groupedItems;
};

export const getCreatingSourceColumns = (args: {
    handleFileSourceUpdate: HandleFileSourceUpdate;
    item: NonNullableBy<FileSourceItem, 'options'>;
    filter: string;
}): Column<(string | number)[]>[] => {
    const {handleFileSourceUpdate, item, filter} = args;
    const sourceColumns = get(item, ['options', 'columns']);
    const rawSchema = get(item, ['source', 'raw_schema']);

    return sourceColumns.reduce(
        (acc, column, index) => {
            const schema = (rawSchema || []).find(({name}) => name === column.name);
            const title = schema?.title || column.name;

            if (!filter || isTitleMatchedByFilter(title, filter)) {
                acc.push({
                    name: column.name,
                    header: (
                        <React.Fragment>
                            {schema && (
                                <TypeSelect
                                    types={column.user_type}
                                    value={schema.user_type}
                                    onUpdate={getSelectUpdateHandler(
                                        handleFileSourceUpdate,
                                        item,
                                        column.name,
                                    )}
                                />
                            )}
                            {title}
                        </React.Fragment>
                    ),
                    sortable: false,
                    render: ({row}) => row[index],
                });
            }

            return acc;
        },
        [] as Column<(string | number)[]>[],
    );
};

export const getListItemId = (item?: ListItemProps) => {
    if (!item) {
        return '';
    }

    if ('file' in item) {
        // id can be an empty string if the file is being downloaded (not polling) or the download has dropped
        return item.id || item.file.name;
    }

    if ('source_id' in item) {
        return item.source_id;
    }

    if ('source' in item) {
        return item.source.source_id;
    }

    if ('id' in item) {
        return item.id;
    }

    console.warn('getListItemId: unknown item type');

    return '';
};

export const getListItemById = (items: FileListItem[], id: string) => {
    let index = -1;
    const item = items.find((iteratedItem, iteratedItemIndex) => {
        if ('groupTitle' in iteratedItem) {
            return false;
        }

        const iteratedItemId = getListItemId(iteratedItem);
        const isMatch = iteratedItemId === id;

        if (isMatch) {
            index = iteratedItemIndex;
        }

        return isMatch;
    });

    return {item: item as ListItemProps, index};
};

export const getGroupedItems = (items: ListItemProps[]): FileListItem[] => {
    const mustBeGrouped = isItemsMustBeGrouped(items);

    if (!mustBeGrouped) {
        return items;
    }

    return flow([getSortedListItems, getGroupedListItems])(items);
};

export const getListItemHeight: ListProps<FileListItem>['itemHeight'] = (item) => {
    if ('groupTitle' in item) {
        return GROUP_TITLE_HEIGHT;
    }

    return ITEM_HEIGHT;
};

export const patchItemsByListData = (
    items: ListItemProps[],
    beingDeletedSourceId: string,
): ListItemData<ListItemProps>[] => {
    return items.reduce((acc, item) => {
        const itemId = getListItemId(item);

        if (itemId === beingDeletedSourceId) {
            (item as ListItemData<ListItemProps>).disabled = true;
        }

        acc.push(item);

        return acc;
    }, [] as ListItemData<ListItemProps>[]);
};

export const getCreatingSourceItemDescription = (args: {
    error?: DataLensApiError;
    disabled?: boolean;
}) => {
    const {error, disabled} = args;

    if (error) {
        return i18n('label_list-item-no-data');
    }

    if (disabled) {
        return i18n('label_source-replacing');
    }

    return undefined;
};

export const getAcceptedExtensions = () => {
    let acceptedExtensions = ACCEPTED_EXTENTIONS;

    if (isEnabledFeature(Feature.XlsxFilesEnabled)) {
        acceptedExtensions += ',.xlsx';
    }

    return acceptedExtensions;
};
