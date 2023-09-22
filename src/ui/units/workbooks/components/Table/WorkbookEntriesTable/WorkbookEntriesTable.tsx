import {DL} from 'constants/common';

import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import block from 'bem-cn-lite';
import {EntryIcon} from 'components/EntryIcon/EntryIcon';
import {I18n} from 'i18n';
import {useInView} from 'react-intersection-observer';
import {useDispatch} from 'react-redux';
import {Link} from 'react-router-dom';

import {GetEntryResponse} from '../../../../../../shared/schema';
import {WorkbookWithPermissions} from '../../../../../../shared/schema/us/types';
import {registry} from '../../../../../registry';
import {AppDispatch} from '../../../../../store';
import {closeDialog, openDialog} from '../../../../../store/actions/dialog';
import {WorkbookEntry} from '../../../types';
import {DIALOG_DELETE_ENTRY_IN_NEW_WORKBOOK} from '../../DeleteEntryDialog/DeleteEntryDialog';
import {DIALOG_DUPLICATE_ENTRY_IN_WORKBOOK} from '../../DuplicateEntryDialog/DuplicateEntryDialog';
import {EntryActions} from '../../EntryActions/EntryActions';
import {DIALOG_RENAME_ENTRY_IN_NEW_WORKBOOK} from '../../RenameEntryDialog/RenameEntryDialog';

import {ChunkItem, useChunkedEntries} from './useChunkedEntries';

import './WorkbookEntriesTable.scss';

const i18n = I18n.keyset('new-workbooks');

const b = block('dl-workbook-entries-table');

const DATETIME_FORMAT = 'DD.MM.YYYY HH:mm:ss';
const options = {
    rootMargin: '200% 0px',
};
const ROW_HEIGHT = 48;
const defaultRowStyle: React.CSSProperties = {
    height: ROW_HEIGHT,
};
const onClickStopPropogation: React.MouseEventHandler = (e) => {
    e.stopPropagation();
    e.preventDefault();
};

type WorkbookEntriesTableProps = {
    workbook: WorkbookWithPermissions;
    entries: GetEntryResponse[];
    refreshEntries: () => void;
};

export const WorkbookEntriesTable = React.memo<WorkbookEntriesTableProps>(
    ({workbook, entries, refreshEntries}) => {
        const dispatch: AppDispatch = useDispatch();

        const onRenameEntry = React.useCallback(
            (entity: WorkbookEntry) => {
                dispatch(
                    openDialog({
                        id: DIALOG_RENAME_ENTRY_IN_NEW_WORKBOOK,
                        props: {
                            open: true,
                            data: entity,
                            onClose: () => dispatch(closeDialog()),
                        },
                    }),
                );
            },
            [dispatch],
        );

        const onDeleteEntry = React.useCallback(
            (entity: WorkbookEntry) => {
                dispatch(
                    openDialog({
                        id: DIALOG_DELETE_ENTRY_IN_NEW_WORKBOOK,
                        props: {
                            open: true,
                            data: entity,
                            onClose: () => dispatch(closeDialog()),
                        },
                    }),
                );
            },
            [dispatch],
        );

        const onApplyDuplicate = React.useCallback(() => {
            refreshEntries();
        }, [refreshEntries]);

        const onDuplicateEntry = React.useCallback(
            (entity: WorkbookEntry) => {
                dispatch(
                    openDialog({
                        id: DIALOG_DUPLICATE_ENTRY_IN_WORKBOOK,
                        props: {
                            open: true,
                            onClose: () => dispatch(closeDialog()),
                            onApply: onApplyDuplicate,
                            initName: entity.name,
                            entryId: entity.entryId,
                        },
                    }),
                );
            },
            [dispatch, onApplyDuplicate],
        );

        const chunks = useChunkedEntries(entries);

        return (
            <div className={b()}>
                <div className={b('table')}>
                    <div className={b('header')}>
                        <div className={b('header-row')} style={defaultRowStyle}>
                            <div className={b('header-cell', {title: true})}>
                                {i18n('label_title')}
                            </div>
                            <div className={b('header-cell')}>{i18n('label_last-modified')}</div>
                            <div className={b('header-cell')} />
                        </div>
                    </div>
                    {chunks.map((chunk) => {
                        return (
                            <ChunkGroup
                                key={chunk[0].key}
                                workbook={workbook}
                                chunk={chunk}
                                onRenameEntry={onRenameEntry}
                                onDeleteEntry={onDeleteEntry}
                                onDuplicateEntry={onDuplicateEntry}
                            />
                        );
                    })}
                </div>
            </div>
        );
    },
);

WorkbookEntriesTable.displayName = 'WorkbookEntriesTable';
type ChunkGroupProps = {
    chunk: ChunkItem[];
    workbook: WorkbookWithPermissions;
    onRenameEntry: (data: WorkbookEntry) => void;
    onDeleteEntry: (data: WorkbookEntry) => void;
    onDuplicateEntry: (data: WorkbookEntry) => void;
};

function ChunkGroup({
    chunk,
    workbook,
    onRenameEntry,
    onDeleteEntry,
    onDuplicateEntry,
}: ChunkGroupProps) {
    const {ref, inView} = useInView(options);

    const height = chunk.length * ROW_HEIGHT;

    const renderContent = () =>
        chunk.map((chunkItem) => {
            switch (chunkItem.type) {
                case 'entry':
                    return (
                        <Row
                            key={chunkItem.key}
                            workbook={workbook}
                            item={chunkItem.item}
                            onRenameEntry={onRenameEntry}
                            onDeleteEntry={onDeleteEntry}
                            onDuplicateEntry={onDuplicateEntry}
                        />
                    );
                case 'empty':
                    return <EmptyRow key={chunkItem.key} />;
                default:
                    return null;
            }
        });

    return (
        <div ref={ref} className={b('chunk-group')}>
            {inView ? renderContent() : <div className={b('hidden-row')} style={{height}} />}
        </div>
    );
}

type RowProps = {
    item: WorkbookEntry;
    workbook: WorkbookWithPermissions;
    onRenameEntry: (data: WorkbookEntry) => void;
    onDeleteEntry: (data: WorkbookEntry) => void;
    onDuplicateEntry: (data: WorkbookEntry) => void;
};

function Row({item, workbook, onRenameEntry, onDeleteEntry, onDuplicateEntry}: RowProps) {
    const {getWorkbookEntryUrl} = registry.workbooks.functions.getAll();
    const url = getWorkbookEntryUrl(item, workbook);

    return (
        <Link to={url} className={b('content-row')} style={defaultRowStyle}>
            <div className={b('content-cell', {title: true})}>
                <div className={b('title-col', {'is-mobile': DL.IS_MOBILE})}>
                    <EntryIcon entry={item} className={b('icon')} width="24" height="24" />
                    <div className={b('title-col-text')} title={item.name}>
                        {item.name}
                    </div>
                </div>
            </div>
            <div className={b('content-cell')}>
                {dateTime({
                    input: item.updatedAt,
                }).format(DATETIME_FORMAT)}
            </div>
            {workbook.permissions.update && (
                <div className={b('content-cell')} onClick={onClickStopPropogation}>
                    <div className={b('control-col')}>
                        <div>
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
                            />
                        </div>
                    </div>
                </div>
            )}
        </Link>
    );
}

function EmptyRow() {
    return (
        <div className={b('empty-row')} style={defaultRowStyle}>
            <div className={b('empty-cell')}>{i18n('label_no-data')}</div>
            <div className={b('empty-cell')} />
            <div className={b('empty-cell')} />
        </div>
    );
}
