import React from 'react';

import {dateTimeParse} from '@gravity-ui/date-utils';
import type {DropdownMenuItemMixed} from '@gravity-ui/uikit';
import {ActionTooltip, DropdownMenu, Icon, Popover, spacing} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {RevisionsListQa} from 'shared/constants/qa';
import {RevisionStatusPoint} from 'ui/components/RevisionStatusPoint/RevisionStatusPoint';
import {registry} from 'ui/registry';
import {copyTextWithToast} from 'ui/utils/copyText';
import {
    getRevisionStatus,
    getRevisionStatusKey,
    isDraftVersion,
    isPublishedVersion,
} from 'ui/utils/revisions';

import type {GetRevisionsEntry} from '../../../../shared/schema';
import {prepareRevisionListItems} from '../helpers';
import type {GetRevisionMenuItems, GetRevisionRowExtendedProps, RevisionsListItems} from '../types';

import iconId from 'ui/assets/icons/id-square.svg';

import './RevisionsList.scss';

const DATE_FORMAT = 'DD MMMM YYYY';
const TIME_FORMAT = 'H:mm:ss';
const TOOLTIP_DELAY_CLOSING = 100;

const contextMenuI18n = I18n.keyset('component.revisions-panel.view');

const b = block('revisions-list');

export type RevisionRowProps = {
    item: GetRevisionsEntry;
    onItemClick: (param: string) => void;
    currentRevId: string;
    renderItemActions?: (item: GetRevisionsEntry, currentRevId: string) => React.ReactNode;
    getRevisionRowExtendedProps?: GetRevisionRowExtendedProps;
    getMenuItems?: GetRevisionMenuItems;
};

const RevisionRow: React.FC<RevisionRowProps> = ({
    item,
    onItemClick,
    currentRevId,
    renderItemActions,
    getRevisionRowExtendedProps,
    getMenuItems,
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

    const defaultMenuItems: DropdownMenuItemMixed<unknown>[] = React.useMemo(
        () => [
            {
                action: (event) => {
                    event.stopPropagation();
                    copyTextWithToast({
                        copyText: item.revId,
                        successText: contextMenuI18n('toast_copy-id-success'),
                        errorText: contextMenuI18n('toast_copy-error'),
                        toastName: 'toast-menu-copy-id',
                    });
                },
                text: contextMenuI18n('context-menu_copy-id'),
                iconStart: <Icon size={16} data={iconId} />,
            },
        ],
        [item],
    );

    const menuItems = React.useMemo(() => {
        return getMenuItems ? getMenuItems(defaultMenuItems, item) : defaultMenuItems;
    }, [defaultMenuItems, getMenuItems, item]);

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
                <div className={b('row-actions')}>
                    {customActions}
                    <DropdownMenu
                        switcherWrapperClassName={spacing({ml: 1})}
                        onSwitcherClick={(event) => {
                            event.stopPropagation();
                        }}
                        defaultSwitcherProps={{
                            view: 'flat-secondary',
                        }}
                        popupProps={{
                            placement: 'bottom-end',
                        }}
                        items={menuItems}
                    />
                </div>
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
    getMenuItems?: GetRevisionMenuItems;
};

const RevisionsListDay: React.FC<RevisionsListDayProps> = ({
    date,
    items,
    onItemClick,
    currentRevId,
    renderItemActions,
    getRevisionRowExtendedProps,
    getMenuItems,
}) => {
    const list = items.map((item) => (
        <RevisionRow
            item={item}
            key={`rev-item-${date}-${item.revId}-${item.updatedAt}`}
            onItemClick={onItemClick}
            currentRevId={currentRevId}
            renderItemActions={renderItemActions}
            getRevisionRowExtendedProps={getRevisionRowExtendedProps}
            getMenuItems={getMenuItems}
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
    getContextMenuItems?: GetRevisionMenuItems;
};

export const RevisionsList: React.FC<RevisionsListProps> = ({
    items,
    onItemClick,
    currentRevId,
    renderItemActions,
    getRevisionRowExtendedProps,
    getContextMenuItems,
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
            getMenuItems={getContextMenuItems}
        />
    ));

    return <div className={b()}>{list}</div>;
};
