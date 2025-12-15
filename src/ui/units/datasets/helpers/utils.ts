import _get from 'lodash/get';
import type {
    DatasetField,
    DatasetSource,
    DatasetSourceAvatar,
    Feature,
    SourceListingOptions,
    WorkbookId,
} from 'shared';
import {DL} from 'ui';
import type {EntryContextMenuItem} from 'ui/components/EntryContextMenu/helpers';
import {getRouter} from 'ui/navigation';
import type {Target} from 'ui/navigation';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {
    SharedDatasetHiddenContextMenuItems,
    SharedWorkbookDatasetHiddenContextMenuItems,
} from '../constants';

export default class DatasetUtils {
    static sortObjectBy(sortParameter: string) {
        return (current: Record<string, any>, next: Record<string, any>) => {
            const currentValue = current[sortParameter];
            const nextValue = next[sortParameter];

            return currentValue.localeCompare(nextValue, undefined, {numeric: true});
        };
    }

    static sortStrings(
        current: string,
        next: string,
        opt: {order: 'asc' | 'desc'} = {order: 'asc'},
    ) {
        const {order} = opt;

        return order === 'asc'
            ? current.localeCompare(next, undefined, {numeric: true})
            : next.localeCompare(current, undefined, {numeric: true});
    }

    static filter(items: any[], searchPhrase: string, path: string) {
        function getValue(item: Record<string, any>) {
            if (path) {
                return _get(item, path);
            }

            return item;
        }

        return items.filter((item: any) => {
            return getValue(item).toLowerCase().includes(searchPhrase.toLowerCase());
        });
    }

    static getNameByKey({key = ''}) {
        const matchedValues = key.match(/\/([^/]*)$/);

        return matchedValues ? matchedValues[1] : key;
    }

    static divideKey(key = '') {
        return key.split('/').filter((part) => part);
    }

    static getPersonalFolderPath() {
        return DL.USER_FOLDER;
    }

    static getQueryParam(name: string) {
        const router = getRouter();
        const param = router.location().params().get(name);

        return param ? decodeURIComponent(param) : undefined;
    }

    static openCreationWidgetPage({
        datasetId,
        target = '_blank',
        workbookId,
    }: {
        datasetId: string;
        target?: Target;
        workbookId?: WorkbookId;
    }) {
        const {endpoints: {wizard = '/wizard'} = {}} = window.DL;
        const pathname = workbookId ? `/workbooks/${workbookId}${wizard}/` : `${wizard}/`;

        getRouter().open({pathname, search: `__datasetId=${datasetId}`}, target);
    }

    static isEnabledFeature(featureName: Feature) {
        return isEnabledFeature(featureName);
    }

    static getSourceTitle(source: {group?: string[]; title?: string}) {
        const {group = [], title = ''} = source;

        const prefix = group.length ? `${group.join('.')}.` : '';

        return `${prefix}${title}`;
    }

    static getNextAvatarPostfixNumber({
        avatars = [],
        sourceId,
    }: {
        avatars?: DatasetSourceAvatar[];
        sourceId: string;
    }) {
        const currentMaxPostfixNumber = Math.max(
            ...avatars
                .filter(({source_id: avatarSourceId}) => avatarSourceId === sourceId)
                .map(({title}) => {
                    const matchedNumber = /^.*\s\((\d)\)$/.exec(title);

                    if (matchedNumber) {
                        return Number(matchedNumber[1]);
                    }

                    return 0;
                }),
        );

        return currentMaxPostfixNumber === 0 ? 2 : currentMaxPostfixNumber + 1;
    }

    static formAvatarTitle({
        avatars,
        source,
    }: {
        avatars: DatasetSourceAvatar[];
        source: DatasetSource;
    }) {
        const formedTitle = DatasetUtils.getSourceTitle(source);

        const existedAvatarWithTitle = avatars.find(({title}) => title === formedTitle);

        if (existedAvatarWithTitle) {
            const {source_id: sourceId} = existedAvatarWithTitle;

            const postfixNumber = DatasetUtils.getNextAvatarPostfixNumber({avatars, sourceId});

            return `${formedTitle} (${postfixNumber})`;
        }

        return formedTitle;
    }

    static filterVirtual({virtual}: {virtual: boolean}) {
        return !virtual;
    }

    static filterDatasetParameters(field: DatasetField) {
        return DatasetUtils.filterVirtual(field) && field.calc_mode === 'parameter';
    }

    static filterDatasetFields(field: DatasetField) {
        return DatasetUtils.filterVirtual(field) && field.calc_mode !== 'parameter';
    }
}

export function isCreationProcess(pathname = '') {
    const lastPathnamePart = pathname.split('/').filter(Boolean).slice(-1)[0];
    return lastPathnamePart === 'new';
}

export function getSourceListingValues(sourceListing?: SourceListingOptions['source_listing']) {
    const serverPagination = sourceListing?.supports_source_pagination;
    const serverSearch = sourceListing?.supports_source_search;
    const supportsDbNameListing = sourceListing?.supports_db_name_listing;
    const parentLabel = sourceListing?.db_name_label;
    const dbNameRequiredForSearch = sourceListing?.db_name_required_for_search;

    return {
        serverSearch,
        serverPagination,
        supportsDbNameListing,
        parentLabel,
        dbNameRequiredForSearch,
    };
}

export const filterContextMenuItems = ({
    items,
    isSharedDataset,
    isWorkbookSharedDataset,
}: {
    items: EntryContextMenuItem[];
    isSharedDataset: boolean;
    isWorkbookSharedDataset: boolean;
}) => {
    return items.filter((item) => {
        if (isWorkbookSharedDataset && SharedWorkbookDatasetHiddenContextMenuItems.has(item.id)) {
            return false;
        }
        if (isSharedDataset && SharedDatasetHiddenContextMenuItems.has(item.id)) {
            return false;
        }
        return true;
    });
};
