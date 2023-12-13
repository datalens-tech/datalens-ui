import React from 'react';

import {ChevronDown, ChevronUp, Plus} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {EntryScope} from 'shared';

import {ChunkGroup} from '../ChunkGroup/ChunkGroup';
import {WorkbookEntriesTableProps} from '../types';
import {ChunkItem} from '../useChunkedEntries';

import './MainTabContent.scss';

const b = block('dl-main-tab-content');

const i18n = I18n.keyset('new-workbooks');

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
    const [mapOpenness, setMapOpenness] = React.useState<Record<string, boolean>>({});

    React.useEffect(() => {
        const openness: Record<string, boolean> = {};

        Object.keys(EntryScope).forEach((key: string) => {
            openness[key] = true;
        });

        setMapOpenness(mapOpenness);
    }, [mapOpenness]);

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

    const getNoObjectsText = (key: string) =>
        mapOpenness[key] && <div className={b('no-objects')}>{i18n('no_objects')}</div>;

    const handleVisibility = (key: string) => {
        setMapOpenness({
            ...mapOpenness,
            [key]: !mapOpenness[key],
        });
    };

    return (
        <>
            <div className={b()}>
                <div className={b('content-cell')}>
                    <div className={b('title')}>
                        <div
                            className={b('visibility-btn')}
                            onClick={() => handleVisibility(EntryScope.Dash)}
                        >
                            {mapOpenness['dash'] ? <ChevronDown /> : <ChevronUp />}
                        </div>
                        <div className={b('title-text')}>Дашборды</div>
                    </div>
                </div>
                <div className={b('content-cell')} />
                <div className={b('content-cell')}>
                    <div className={b('create-btn')}>
                        <Button>
                            <Icon data={Plus} />
                            {i18n('action_create-dashboard')}
                        </Button>
                    </div>
                </div>
            </div>

            {dashChunk.length > 0 ? (
                <ChunkGroup
                    key={dashChunk[0].key}
                    workbook={workbook}
                    chunk={dashChunk}
                    onRenameEntry={onRenameEntry}
                    onDeleteEntry={onDeleteEntry}
                    onDuplicateEntry={onDuplicateEntry}
                    onCopyEntry={onCopyEntry}
                    isOpen={mapOpenness[EntryScope.Dash]}
                />
            ) : (
                getNoObjectsText(EntryScope.Dash)
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
