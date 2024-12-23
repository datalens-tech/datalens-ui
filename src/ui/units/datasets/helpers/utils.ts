import _get from 'lodash/get';
import type {DatasetField, DatasetSource, DatasetSourceAvatar, Feature, WorkbookId} from 'shared';
import {DL} from 'ui';

import Utils from '../../../utils';

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
        const searchParams = new URLSearchParams(window.location.search);
        const param = searchParams.get(name);

        return param ? decodeURIComponent(param) : undefined;
    }

    static openCreationWidgetPage({
        datasetId,
        target = '_blank',
        workbookId,
    }: {
        datasetId: string;
        target?: string;
        workbookId?: WorkbookId;
    }) {
        const {endpoints: {wizard = '/wizard'} = {}} = window.DL;

        if (workbookId) {
            window.open(`/workbooks/${workbookId}${wizard}/?__datasetId=${datasetId}`, target);
        } else {
            window.open(`${wizard}/?__datasetId=${datasetId}`, target);
        }
    }

    static isEnabledFeature(featureName: Feature) {
        return Utils.isEnabledFeature(featureName);
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
