import React from 'react';

import block from 'bem-cn-lite';
import {useInView} from 'react-intersection-observer';
import {WorkbookPageQa} from 'shared/constants';
import type {ChunkItem, WorkbookEntry} from 'ui/units/workbooks/types';

import {EmptyRow, Row} from '../Row/Row';
import {ROW_HEIGHT, options} from '../constants';
import type {WorkbookEntriesTableProps} from '../types';

import './ChunkGroup.scss';

interface ChunkGroupProps<T extends WorkbookEntry> extends WorkbookEntriesTableProps<T> {
    chunk: ChunkItem<T>[];
}

const b = block('dl-workbook-entries-chunk-group');

export function ChunkGroup<T extends WorkbookEntry>({
    chunk,
    workbook,
    onRenameEntry,
    onDeleteEntry,
    onDuplicateEntry,
    onCopyEntry,
    onShowRelatedClick,
    onCopyId,
    onUpdateSharedEntryBindings,
}: ChunkGroupProps<T>) {
    const {ref, inView} = useInView(options);

    const height = chunk.length * ROW_HEIGHT;

    const chunkScopeQa =
        chunk[0]?.type === 'entry'
            ? `${WorkbookPageQa.ChunkScope}${chunk[0].item.scope}`
            : undefined;

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
                            onCopyEntry={onCopyEntry}
                            onShowRelatedClick={onShowRelatedClick}
                            onUpdateSharedEntryBindings={onUpdateSharedEntryBindings}
                            onCopyId={onCopyId}
                        />
                    );
                case 'empty':
                    return <EmptyRow key={chunkItem.key} />;
                default:
                    return null;
            }
        });

    return (
        <div ref={ref} className={b()} data-qa={chunkScopeQa}>
            {inView ? renderContent() : <div className={b('hidden-row')} style={{height}} />}
        </div>
    );
}
