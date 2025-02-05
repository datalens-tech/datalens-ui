import React from 'react';

import {Popover} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import moment from 'moment';
import {registry} from 'ui/registry';

import type {GetRevisionsEntry} from '../../../../shared/schema';
import {
    getRevisionStatus,
    isDraftVersion,
    isPublishedVersion,
    prepareRevisionListItems,
} from '../helpers';
import type {RevisionsListItems} from '../types';

import './RevisionsList.scss';

const DATE_FORMAT = 'DD MMMM YYYY';
const TIME_FORMAT = 'H:mm:ss';
const TOOLTIP_DELAY_CLOSING = 100;

const i18n = I18n.keyset('component.dialog-revisions.view');
const b = block('revisions-list');

export const REVISIONS_STATUSES_TEXTS = {
    published: i18n('label_status-tooltip-published'),
    draft: i18n('label_status-tooltip-draft'),
    current: i18n('label_status-tooltip-current'),
    notActual: i18n('label_status-tooltip-not-actual'),
};

type RevisionRowProps = {
    item: GetRevisionsEntry;
    onItemClick: (param: string) => void;
    currentRevId: string;
    renderItemActions?: (item: GetRevisionsEntry, currentRevId: string) => React.ReactNode;
};

const RevisionRow: React.FC<RevisionRowProps> = ({
    item,
    onItemClick,
    currentRevId,
    renderItemActions,
}) => {
    const handlerClick = () => onItemClick(item.revId);
    const {updatedAt, updatedBy} = item;
    const isPublished = isPublishedVersion(item);
    const isDraft = isDraftVersion(item);
    const tooltipText = getRevisionStatus(item);

    const {UserAvatarById} = registry.common.components.getAll();

    const customActions = renderItemActions?.(item, currentRevId);

    return (
        <li
            className={b('row', {
                published: isPublished,
                current: currentRevId === item.revId,
                draft: isDraft,
            })}
            data-qa="revisions-list-row"
            data-qa-revid={item.revId}
            onClick={handlerClick}
        >
            {tooltipText ? (
                <Popover
                    placement={'bottom'}
                    hasArrow={false}
                    delayClosing={TOOLTIP_DELAY_CLOSING}
                    content={tooltipText}
                    className={b('point-wrap')}
                >
                    <span className={b('point')} />
                </Popover>
            ) : (
                <div className={b('point-wrap')}>
                    <span className={b('point')} />
                </div>
            )}
            <UserAvatarById loginOrId={updatedBy} size="s" className={b('avatar')} />
            <div className={b('text')}>{moment(updatedAt).format(TIME_FORMAT)}</div>
            <div className={b('row-actions')}>{customActions}</div>
        </li>
    );
};

type RevisionsListDayProps = {
    date: string;
    items: Array<GetRevisionsEntry>;
    onItemClick: (param: string) => void;
    currentRevId: string;

    renderItemActions?: RevisionRowProps['renderItemActions'];
};

const RevisionsListDay: React.FC<RevisionsListDayProps> = ({
    date,
    items,
    onItemClick,
    currentRevId,
    renderItemActions,
}) => {
    const list = items.map((item) => (
        <RevisionRow
            item={item}
            key={`rev-item-${date}-${item.revId}-${item.updatedAt}`}
            onItemClick={onItemClick}
            currentRevId={currentRevId}
            renderItemActions={renderItemActions}
        />
    ));
    return (
        <div className={b('block')}>
            <div className={b('label')}>{moment(date).format(DATE_FORMAT)}</div>
            {list.length && (
                <ul className={b('content')} data-qa="revisions-list">
                    {list}
                </ul>
            )}
        </div>
    );
};

type RevisionsListProps = {
    items: RevisionsListItems;
    onItemClick: (param: string) => void;
    currentRevId: string;
    renderItemActions?: RevisionsListDayProps['renderItemActions'];
};

export const RevisionsList: React.FC<RevisionsListProps> = ({
    items,
    onItemClick,
    currentRevId,
    renderItemActions,
}) => {
    const preparedItems = React.useMemo(() => prepareRevisionListItems(items), [items]);
    const list = preparedItems.map((listItems, index) => (
        <RevisionsListDay
            key={`rev-list-${listItems.date}-${index}`}
            date={listItems.date}
            items={listItems.dayItems}
            onItemClick={onItemClick}
            currentRevId={currentRevId}
            renderItemActions={renderItemActions}
        />
    ));

    return <div className={b()}>{list}</div>;
};
