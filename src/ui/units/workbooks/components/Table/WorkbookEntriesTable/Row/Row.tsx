import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import block from 'bem-cn-lite';
import {EntryIcon} from 'components/EntryIcon/EntryIcon';
import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import {Link} from 'react-router-dom';
import {DEFAULT_DATE_FORMAT} from 'shared';
import {WorkbookPageQa} from 'shared/constants/qa/workbooks';
import type {WorkbookWithPermissions} from 'shared/schema/us/types/workbooks';
import {DL} from 'ui/constants/common';
import {registry} from 'ui/registry/index';
import type {AppDispatch} from 'ui/store';
import {changeFavoriteEntry} from 'ui/units/workbooks/store/actions';
import type {WorkbookEntry} from 'ui/units/workbooks/types/index';

import {EntryActions} from '../../../EntryActions/EntryActions';
import {defaultRowStyle, mobileRowStyle} from '../constants';
import {getIsCanShowContextMenu, getIsCanUpdateSharedEntryBindings} from '../utils';

import './Row.scss';

const i18n = I18n.keyset('new-workbooks');

type RowProps<T extends WorkbookEntry> = {
    item: T;
    workbook: WorkbookWithPermissions;
    isOpen?: boolean;
    onRenameEntry?: (data: T) => void;
    onDeleteEntry?: (data: T) => void;
    onDuplicateEntry?: (data: T) => void;
    onCopyEntry?: (data: T) => void;
    onShowRelatedClick?: (data: T) => void;
    onCopyId?: (data: T) => void;
    onUpdateSharedEntryBindings?: (data: T) => void;
};

const onClickStopPropogation: React.MouseEventHandler = (e) => {
    e.stopPropagation();
    e.preventDefault();
};

const b = block('dl-content-row');

const Row = <T extends WorkbookEntry>({
    item,
    workbook,
    onRenameEntry,
    onDeleteEntry,
    onDuplicateEntry,
    onCopyEntry,
    onShowRelatedClick,
    onCopyId,
    onUpdateSharedEntryBindings,
}: RowProps<T>) => {
    const {getWorkbookEntryUrl} = registry.workbooks.functions.getAll();
    const {WorkbookTableRowExtendedContent} = registry.workbooks.components.getAll();
    const {getLoginById} = registry.common.functions.getAll();
    const dispatch: AppDispatch = useDispatch();
    const isSharedEntry = Boolean(item.collectionId);

    const url = getWorkbookEntryUrl(item, workbook, isSharedEntry);

    const LoginById = getLoginById();

    const isShowLogin = LoginById && item.createdBy;

    const onChangeFavorite = () => {
        const {entryId, isFavorite} = item;

        dispatch(
            changeFavoriteEntry({
                entryId,
                isFavorite: !isFavorite,
                updateInline: true,
            }),
        );
    };

    const {ButtonFavorite} = registry.common.components.getAll();

    if (DL.IS_MOBILE) {
        return (
            <Link
                to={url}
                className={b({mobile: true})}
                style={mobileRowStyle}
                data-qa={WorkbookPageQa.ListItem}
            >
                <div className={b('content-cell', {title: true})} data-qa={item.entryId}>
                    <div className={b('title-col')}>
                        <EntryIcon entry={item} entityIconSize="xl" />
                        <div
                            className={b('title-col-text')}
                            data-qa={WorkbookPageQa.ListItemName}
                            title={item.name}
                        >
                            {item.name}
                        </div>
                    </div>
                </div>
                <div className={b('content-cell', {date: true})}>
                    {dateTime({
                        input: item.updatedAt,
                    }).format(DEFAULT_DATE_FORMAT)}
                </div>
            </Link>
        );
    }

    return (
        <Link to={url} className={b()} style={defaultRowStyle} data-qa={WorkbookPageQa.ListItem}>
            <div className={b('content-cell', {title: true})} data-qa={item.entryId}>
                <div className={b('title-col', {'is-mobile': DL.IS_MOBILE})}>
                    <EntryIcon entry={item} width={24} height={24} />
                    <div
                        className={b('title-col-text')}
                        data-qa={WorkbookPageQa.ListItemName}
                        title={item.name}
                    >
                        {item.name}
                    </div>
                    <WorkbookTableRowExtendedContent
                        item={item}
                        workbook={workbook}
                        onUpdateSharedEntryBindings={
                            onUpdateSharedEntryBindings && (() => onUpdateSharedEntryBindings(item))
                        }
                    />
                </div>
            </div>
            <div className={b('content-cell', {author: true})}>
                {isShowLogin && (
                    <LoginById
                        className={b('author-text')}
                        loginOrId={item.createdBy}
                        view="secondary"
                    />
                )}
            </div>
            <div className={b('content-cell', {date: true})}>
                {dateTime({
                    input: item.updatedAt,
                }).fromNow()}
            </div>

            <div className={b('content-cell', {controls: true})} onClick={onClickStopPropogation}>
                <div className={b('control-col')}>
                    <ButtonFavorite
                        className={b('btn-favorite', {'is-favorite': item.isFavorite})}
                        onClick={onChangeFavorite}
                        isFavorite={item.isFavorite}
                    />
                    {getIsCanShowContextMenu(item, workbook.permissions) && (
                        <div className={b('btn-actions')}>
                            <EntryActions
                                workbook={workbook}
                                entry={item}
                                onRenameClick={onRenameEntry && (() => onRenameEntry(item))}
                                onDeleteClick={onDeleteEntry && (() => onDeleteEntry(item))}
                                onDuplicateEntry={
                                    onDuplicateEntry && (() => onDuplicateEntry(item))
                                }
                                onCopyEntry={onCopyEntry && (() => onCopyEntry(item))}
                                onShowRelatedClick={
                                    onShowRelatedClick && (() => onShowRelatedClick(item))
                                }
                                onCopyId={onCopyId && (() => onCopyId(item))}
                                onUpdateSharedEntryBindings={
                                    getIsCanUpdateSharedEntryBindings(item) &&
                                    onUpdateSharedEntryBindings &&
                                    (() => onUpdateSharedEntryBindings(item))
                                }
                            />
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

const EmptyRow = ({label}: {label?: React.ReactNode}) => {
    return (
        <div className={b('empty-row')} style={defaultRowStyle}>
            <div className={b('empty-cell')}>{label || i18n('label_no-data')}</div>

            <div className={b('empty-cell')} />
            <div className={b('empty-cell')} />
            <div className={b('empty-cell')} />
        </div>
    );
};

export {Row, EmptyRow};
