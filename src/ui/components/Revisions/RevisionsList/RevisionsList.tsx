import React from 'react';

import {dateTimeParse} from '@gravity-ui/date-utils';
import {ActionTooltip, Popover} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {EntryScope} from 'shared';
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
import {MIN_AVAILABLE_DATASET_REV_DATE, prepareRevisionListItems} from '../helpers';
import type {RevisionsListItems} from '../types';

import './RevisionsList.scss';

const DATE_FORMAT = 'DD MMMM YYYY';
const TIME_FORMAT = 'H:mm:ss';
const TOOLTIP_DELAY_CLOSING = 100;
const DATASET_DISABLED_DATE = dateTimeParse(MIN_AVAILABLE_DATASET_REV_DATE);

const i18n = I18n.keyset('component.dialog-revisions.view');

const b = block('revisions-list');

export type RevisionRowProps = {
    item: GetRevisionsEntry;
    onItemClick: (param: string) => void;
    currentRevId: string;
    renderItemActions?: (item: GetRevisionsEntry, currentRevId: string) => React.ReactNode;
    disabled?: boolean;
    disabledText?: string;
};

const RevisionRow: React.FC<RevisionRowProps> = ({
    item,
    onItemClick,
    currentRevId,
    renderItemActions,
    disabledText = '',
    disabled = false,
}) => {
    const handlerClick = () => onItemClick(item.revId);
    const {updatedAt, updatedBy} = item;
    const isPublished = isPublishedVersion(item);
    const isDraft = isDraftVersion(item);
    const tooltipText = getRevisionStatus(item);

    const {UserAvatarById} = registry.common.components.getAll();

    const customActions = renderItemActions?.(item, currentRevId);

    const revisionStatusKey = getRevisionStatusKey(item);

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

    renderItemActions?: RevisionRowProps['renderItemActions'];
};

const RevisionsListDay: React.FC<RevisionsListDayProps> = ({
    date,
    items,
    onItemClick,
    currentRevId,
    renderItemActions,
}) => {
    const list = items.map((item) => {
        let isDisable = false;
        let disabledText = '';

        if (item.scope === EntryScope.Dataset) {
            const updatedTime = dateTimeParse(item.updatedAt);
            isDisable =
                (updatedTime?.isValid() && updatedTime?.isBefore(DATASET_DISABLED_DATE)) ?? false;
            disabledText = i18n('label_status-tooltip-disable');
        }

        return (
            <RevisionRow
                item={item}
                key={`rev-item-${date}-${item.revId}-${item.updatedAt}`}
                onItemClick={onItemClick}
                currentRevId={currentRevId}
                renderItemActions={renderItemActions}
                disabled={isDisable}
                disabledText={disabledText}
            />
        );
    });

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
