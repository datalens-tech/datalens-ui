import React from 'react';

import {dateTimeParse} from '@gravity-ui/date-utils';
import {ActionTooltip, Popover} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {RevisionsListQa} from 'shared/constants/qa';
import {RevisionStatusPoint} from 'ui/components/RevisionStatusPoint/RevisionStatusPoint';
import {registry} from 'ui/registry';
import {
    getRevisionStatus,
    getRevisionStatusKey,
    isDraftVersion,
    isPublishedVersion,
} from 'ui/utils/revisions';

import type {GetRevisionsEntry} from '../../../../shared/schema';
import {prepareRevisionListItems} from '../helpers';
import type {GetRevisionRowExtendedProps, RevisionsListItems} from '../types';

import './RevisionsList.scss';

const DATE_FORMAT = 'DD MMMM YYYY';
const TIME_FORMAT = 'H:mm:ss';
const TOOLTIP_DELAY_CLOSING = 100;

const b = block('revisions-list');

export type RevisionRowProps = {
    item: GetRevisionsEntry;
    onItemClick: (param: string) => void;
    currentRevId: string;
    renderItemActions?: (item: GetRevisionsEntry, currentRevId: string) => React.ReactNode;
    getRevisionRowExtendedProps?: GetRevisionRowExtendedProps;
};

const RevisionRow: React.FC<RevisionRowProps> = ({
    item,
    onItemClick,
    currentRevId,
    renderItemActions,
    getRevisionRowExtendedProps,
}) => {
    const handlerClick = () => onItemClick(item.revId);
    const {updatedAt, updatedBy} = item;
    const isPublished = isPublishedVersion(item);
    const isDraft = isDraftVersion(item);
    const tooltipText = getRevisionStatus(item);

    const {UserAvatarById} = registry.common.components.getAll();

    const customActions = renderItemActions?.(item, currentRevId);

    const revisionStatusKey = getRevisionStatusKey(item);

    const {disabledText = '', disabled = false} = getRevisionRowExtendedProps?.(item) ?? {};

    return (
        <ActionTooltip title={disabledText} disabled={!disabledText || !disabled}>
            <li
                className={b('row', {
                    published: isPublished,
                    current: currentRevId === item.revId,
                    draft: isDraft,
                    disabled,
                })}
                data-qa={RevisionsListQa.RevisionsListRow}
                data-qa-revid={item.revId}
                onClick={disabled ? undefined : handlerClick}
            >
                {tooltipText ? (
                    <Popover
                        placement={'bottom'}
                        hasArrow={false}
                        closeDelay={TOOLTIP_DELAY_CLOSING}
                        content={tooltipText}
                        className={b('point-tooltip')}
                    >
                        <div className={b('point-wrap')}>
                            <RevisionStatusPoint status={revisionStatusKey} />
                        </div>
                    </Popover>
                ) : (
                    <div className={b('point-wrap')}>
                        <RevisionStatusPoint status={revisionStatusKey} />
                    </div>
                )}
                <UserAvatarById loginOrId={updatedBy} size="s" className={b('avatar')} />
                <div className={b('text')}>
                    {dateTimeParse(updatedAt)?.format(TIME_FORMAT) || updatedAt}
                </div>
                {customActions && <div className={b('row-actions')}>{customActions}</div>}
            </li>
        </ActionTooltip>
    );
};

type RevisionsListDayProps = {
    date: string;
    items: Array<GetRevisionsEntry>;
    onItemClick: (param: string) => void;
    currentRevId: string;
    getRevisionRowExtendedProps?: GetRevisionRowExtendedProps;
    renderItemActions?: RevisionRowProps['renderItemActions'];
};

const RevisionsListDay: React.FC<RevisionsListDayProps> = ({
    date,
    items,
    onItemClick,
    currentRevId,
    renderItemActions,
    getRevisionRowExtendedProps,
}) => {
    const list = items.map((item) => (
        <RevisionRow
            item={item}
            key={`rev-item-${date}-${item.revId}-${item.updatedAt}`}
            onItemClick={onItemClick}
            currentRevId={currentRevId}
            renderItemActions={renderItemActions}
            getRevisionRowExtendedProps={getRevisionRowExtendedProps}
        />
    ));
    return (
        <div className={b('block')}>
            <div className={b('label')}>{dateTimeParse(date)?.format(DATE_FORMAT) || date}</div>
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
    getRevisionRowExtendedProps?: GetRevisionRowExtendedProps;
};

export const RevisionsList: React.FC<RevisionsListProps> = ({
    items,
    onItemClick,
    currentRevId,
    renderItemActions,
    getRevisionRowExtendedProps,
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
            getRevisionRowExtendedProps={getRevisionRowExtendedProps}
        />
    ));

    return <div className={b()}>{list}</div>;
};
