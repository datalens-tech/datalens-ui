import {dateTime, dateTimeParse} from '@gravity-ui/date-utils';

import type {GetRevisionsEntry} from '../../../shared/schema';

import type {RevisionEntry, RevisionsGroupedDates, RevisionsListItems} from './types';

export const REVISIONS_LIST_PART_SIZE = 100;
export const REVISIONS_LIST_DEBOUNCE_DELAY = 100;
export const DATE_GROUPPED_FORMAT = 'YYYY-MM-DD';

const getDateKey = (str: string) => str?.split('T').shift() || '';

const sortByUpdatedDate = (a: GetRevisionsEntry, b: GetRevisionsEntry) => {
    return dateTimeParse(a.updatedAt)?.isAfter(dateTimeParse(b.updatedAt)) ? -1 : 1;
};

const sortByDay = (a: RevisionsGroupedDates, b: RevisionsGroupedDates) =>
    dateTime({input: a.date, format: DATE_GROUPPED_FORMAT}).isAfter(
        dateTime({input: b.date, format: DATE_GROUPPED_FORMAT}),
    )
        ? -1
        : 1;

export const groupRevisionsByDate = (items: Array<RevisionEntry>): RevisionsListItems => {
    const group: RevisionsListItems = {};
    items.forEach((item) => {
        const key = getDateKey(item.updatedAt);
        if (!group[key]) {
            group[key] = [];
        }
        const isItemAlreadyAddedIndex = group[key].findIndex(
            (groupItem) => groupItem.revId === item.revId,
        );
        const isItemAlreadyAdded = isItemAlreadyAddedIndex !== -1;
        if (isItemAlreadyAdded) {
            // replace with an updated record, because publishedId & savedId might be changed by another user
            group[key][isItemAlreadyAddedIndex] = item;
        } else {
            group[key].push(item);
        }
    });

    for (const [key, value] of Object.entries(group)) {
        group[key] = value.sort(sortByUpdatedDate);
    }

    return group;
};

export const prepareRevisionListItems = (items: RevisionsListItems) => {
    const list: Array<RevisionsGroupedDates> = [];
    for (const [date, dayItems] of Object.entries(items)) {
        list.push({date, dayItems});
    }
    return list.sort(sortByDay);
};

// TODO: remove reexport after CHARTS-11009
export {isPublishedVersion, isDraftVersion, getRevisionStatus} from 'ui/utils/revisions';
