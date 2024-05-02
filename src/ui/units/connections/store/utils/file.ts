import {cloneDeep, unionBy} from 'lodash';

import {FileSourceColumnType} from '../../../../../shared/schema';
import logger from '../../../../libs/logger';
import {CreatedSource, CreatingSource, FileSource, FileSourceItem, ReplaceSource} from '../typings';

export const mapSourcesToAPIFormat = (sources: FileSource[]) => {
    return sources.reduce(
        (acc, item) => {
            if ('source' in item) {
                const columnTypes = (item.source.raw_schema || []).map(
                    ({title: _, ...restSchema}) => restSchema,
                );
                acc.push({
                    id: item.source.source_id,
                    file_id: item.file_id,
                    title: item.source.title,
                    column_types: unionBy(item.columnTypes, columnTypes, 'name'),
                });
            }

            if ('id' in item) {
                acc.push({
                    id: item.id,
                    title: item.title,
                });
            }

            return acc;
        },
        [] as (CreatingSource | CreatedSource)[],
    );
};

const findFileSourceItem = (sources: FileSource[], sourceId: string) => {
    return sources.find((source) => {
        if ('source' in source) {
            return source.source.source_id === sourceId;
        }

        return false;
    }) as FileSourceItem | undefined;
};

export const findFileSourceItemIndex = (sources: FileSource[], sourceId: string) => {
    return sources.findIndex((source) => {
        if ('source' in source) {
            return source.source.source_id === sourceId;
        }

        return false;
    });
};

export const mergeColumnTypes = (
    sources: FileSource[],
    sourceId: string,
    columnTypes?: FileSourceColumnType[],
) => {
    const existedSourceItem = findFileSourceItem(sources, sourceId);

    if (existedSourceItem) {
        return unionBy(columnTypes, existedSourceItem.columnTypes, 'name');
    }

    return columnTypes || [];
};

export const getActualReplaceSources = (
    prevReplaceSources: ReplaceSource[],
    beingDeletedSourceId: string,
    newSourceId?: string,
): ReplaceSource[] => {
    if (!newSourceId) {
        logger.log('Redux actions (conn): getActualReplaceSources > newSourceId is not specified');
        return prevReplaceSources;
    }

    let replaceSources = cloneDeep(prevReplaceSources);

    const fileSourceItemIndex = replaceSources.findIndex((replaceSource) => {
        return replaceSource.new_source_id === beingDeletedSourceId;
    });

    if (fileSourceItemIndex === -1) {
        replaceSources = [
            ...replaceSources,
            {
                old_source_id: beingDeletedSourceId,
                new_source_id: newSourceId,
            },
        ];
    } else {
        replaceSources[fileSourceItemIndex].new_source_id = newSourceId;
    }

    return replaceSources;
};
