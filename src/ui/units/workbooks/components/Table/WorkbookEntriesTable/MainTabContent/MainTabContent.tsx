import React from 'react';

import {ChevronDown, ChevronUp} from '@gravity-ui/icons';
import block from 'bem-cn-lite';
import {EntryScope} from 'shared';

import {ChunkGroup} from '../ChunkGroup/ChunkGroup';
import {WorkbookEntriesTableProps} from '../types';
import {ChunkItem} from '../useChunkedEntries';

import './MainTabContent.scss';

const b = block('dl-main-tab-content');

interface MainTabContentProps extends WorkbookEntriesTableProps {
    chunks: ChunkItem[][];
}

const MainTabContent: React.FC<MainTabContentProps> = ({
    workbook,
    chunks,
    onRenameEntry,
    onDeleteEntry,
    onDuplicateEntry,
    onCopyEntry,
}) => {
    const [isOpen, setIsOpen] = React.useState(true);
    const dashChunk: ChunkItem[] = [];
    const connChunk: ChunkItem[] = [];
    const datasetChunk: ChunkItem[] = [];
    const widgetChunk: ChunkItem[] = [];

    chunks.forEach((chunk) => {
        chunk.forEach((chunkItem) => {
            if (chunkItem.type === 'entry') {
                switch (chunkItem.item.scope) {
                    case EntryScope.Dash:
                        dashChunk.push(chunkItem);
                        break;
                    case EntryScope.Connection:
                        connChunk.push(chunkItem);
                        break;
                    case EntryScope.Dataset:
                        datasetChunk.push(chunkItem);
                        break;
                    case EntryScope.Widget:
                        widgetChunk.push(chunkItem);
                        break;
                }
            }
        });
    });

    return (
        <>
            {dashChunk.length > 0 && (
                <>
                    <div className={b()}>
                        <div className={b('visibility-btn')} onClick={() => setIsOpen(!isOpen)}>
                            {isOpen ? <ChevronDown /> : <ChevronUp />}
                        </div>
                        <div className={b('title')}>Дашборды</div>
                        <div className={b('count')}>{dashChunk.length} объектов</div>
                        <div className={b('create-btn')}>Создать дашборд</div>
                    </div>
                    <ChunkGroup
                        key={dashChunk[0].key}
                        workbook={workbook}
                        chunk={dashChunk}
                        onRenameEntry={onRenameEntry}
                        onDeleteEntry={onDeleteEntry}
                        onDuplicateEntry={onDuplicateEntry}
                        onCopyEntry={onCopyEntry}
                        isOpen={isOpen}
                    />
                </>
            )}

            {widgetChunk.length > 0 && (
                <div>
                    <div>Widget</div>
                    <div>Создать Widget</div>
                    <div>
                        <ChunkGroup
                            key={widgetChunk[0].key}
                            workbook={workbook}
                            chunk={widgetChunk}
                            onRenameEntry={onRenameEntry}
                            onDeleteEntry={onDeleteEntry}
                            onDuplicateEntry={onDuplicateEntry}
                            onCopyEntry={onCopyEntry}
                        />
                    </div>
                </div>
            )}

            {datasetChunk.length > 0 && (
                <div>
                    <div>datasetChunks</div>
                    <div>Создать datasetChunks</div>
                    <div>
                        <ChunkGroup
                            key={datasetChunk[0].key}
                            workbook={workbook}
                            chunk={datasetChunk}
                            onRenameEntry={onRenameEntry}
                            onDeleteEntry={onDeleteEntry}
                            onDuplicateEntry={onDuplicateEntry}
                            onCopyEntry={onCopyEntry}
                        />
                    </div>
                </div>
            )}

            {connChunk.length > 0 && (
                <div>
                    <div>connChunks</div>
                    <div>Создать connChunks</div>
                    <div>
                        <ChunkGroup
                            key={connChunk[0].key}
                            workbook={workbook}
                            chunk={connChunk}
                            onRenameEntry={onRenameEntry}
                            onDeleteEntry={onDeleteEntry}
                            onDuplicateEntry={onDuplicateEntry}
                            onCopyEntry={onCopyEntry}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export {MainTabContent};
