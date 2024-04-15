import {DL} from 'constants/common';

import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import block from 'bem-cn-lite';
import {EntryIcon} from 'components/EntryIcon/EntryIcon';
import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import {Link} from 'react-router-dom';
import {WorkbookPage} from 'shared/constants/qa/workbooks';
import {WorkbookWithPermissions} from 'shared/schema/us/types/workbooks';
import {registry} from 'ui/registry/index';
import {AppDispatch} from 'ui/store';
import {changeFavoriteEntry} from 'ui/units/workbooks/store/actions';
import {WorkbookEntry} from 'ui/units/workbooks/types/index';

import {EntryActions} from '../../../EntryActions/EntryActions';
import {defaultRowStyle} from '../constants';

import './Row.scss';

const i18n = I18n.keyset('new-workbooks');

type RowProps = {
    item: WorkbookEntry;
    workbook: WorkbookWithPermissions;
    isOpen?: boolean;
    onRenameEntry: (data: WorkbookEntry) => void;
    onDeleteEntry: (data: WorkbookEntry) => void;
    onDuplicateEntry: (data: WorkbookEntry) => void;
    onCopyEntry: (data: WorkbookEntry) => void;
};

const onClickStopPropogation: React.MouseEventHandler = (e) => {
    e.stopPropagation();
    e.preventDefault();
};

const b = block('dl-content-row');

const Row: React.FC<RowProps> = ({
    item,
    workbook,
    onRenameEntry,
    onDeleteEntry,
    onDuplicateEntry,
    onCopyEntry,
}) => {
    const {getWorkbookEntryUrl} = registry.workbooks.functions.getAll();
    const {getLoginById} = registry.common.functions.getAll();

    const dispatch: AppDispatch = useDispatch();

    const url = getWorkbookEntryUrl(item, workbook);

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

    return (
        <Link to={url} className={b()} style={defaultRowStyle} data-qa={WorkbookPage.ListItem}>
            <div className={b('content-cell', {title: true})} data-qa={item.entryId}>
                <div className={b('title-col', {'is-mobile': DL.IS_MOBILE})}>
                    <div className={b('icon')}>
                        <EntryIcon entry={item} width={24} height={24} />
                    </div>
                    <div className={b('title-col-text')} title={item.name}>
                        {item.name}
                    </div>
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
                    {workbook.permissions.update && (
                        <div className={b('btn-actions')}>
                            <EntryActions
                                workbook={workbook}
                                entry={item}
                                onRenameClick={() => {
                                    onRenameEntry(item);
                                }}
                                onDeleteClick={() => {
                                    onDeleteEntry(item);
                                }}
                                onDuplicateEntry={() => {
                                    onDuplicateEntry(item);
                                }}
                                onCopyEntry={() => {
                                    onCopyEntry(item);
                                }}
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
