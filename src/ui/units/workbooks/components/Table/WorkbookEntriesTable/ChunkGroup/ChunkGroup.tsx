import React from 'react';

import block from 'bem-cn-lite';
import {useInView} from 'react-intersection-observer';
import {ChunkItem} from 'ui/units/workbooks/types';

import {EmptyRow, Row} from '../Row/Row';
import {ROW_HEIGHT, options} from '../constants';
import {WorkbookEntriesTableProps} from '../types';

import './ChunkGroup.scss';

interface ChunkGroupProps extends WorkbookEntriesTableProps {
    chunk: ChunkItem[];
}

const b = block('dl-workbook-entries-chunk-group');

export function ChunkGroup({
    chunk,
    workbook,
    onRenameEntry,
    onDeleteEntry,
    onDuplicateEntry,
    onCopyEntry,
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
                            onCopyEntry={onCopyEntry}
                        />
                    );
                case 'empty':
                    return <EmptyRow key={chunkItem.key} />;
                default:
                    return null;
            }
        });

    return (
        <div ref={ref} className={b()}>
            {inView ? renderContent() : <div className={b('hidden-row')} style={{height}} />}
        </div>
    );
}
