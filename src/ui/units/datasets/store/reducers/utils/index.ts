import type {DatasetAvatarRelation, DatasetSource} from '../../../../../../shared';
import {getSourceHashTitleId} from '../../selectors';
import type {FreeformSource, SourcePrototype} from '../../types';

export const isFreeformSource = (
    freeformSources: FreeformSource[],
    sourcePrototypes: SourcePrototype[],
    source: DatasetSource,
) => {
    return (
        freeformSources.some(
            ({source_type: freeformSourceType}) => freeformSourceType === source.source_type,
        ) &&
        !sourcePrototypes.find(
            (sourcePrototype) =>
                getSourceHashTitleId(sourcePrototype) === getSourceHashTitleId(source),
        )
    );
};

export const getFilteredSources = (
    sources: DatasetSource[],
    freeformSources: FreeformSource[],
    sourcePrototypes: SourcePrototype[],
) => {
    return sources.filter((source) => {
        return isFreeformSource(freeformSources, sourcePrototypes, source);
    });
};

export const getAvatarsAndRelationsToDelete = (
    deletedAvatarId: string,
    relations: DatasetAvatarRelation[],
) => {
    const leftIds = [deletedAvatarId];
    const avatarsToDelete = [deletedAvatarId];
    const rootRelationId = relations.find(
        (relation) => relation.right_avatar_id === deletedAvatarId,
    )?.id;
    // Initially, we add to the array a possible relationship in which the avatar being deleted is a child (i.e. on the right)
    const relationsToDelete: string[] = rootRelationId ? [rootRelationId] : [];

    // This is a normal tree traversal, the leftIds array will become empty anyway.
    while (leftIds.length) {
        const id = leftIds.shift();
        relations.forEach((relation) => {
            if (relation.left_avatar_id === id) {
                leftIds.push(relation.right_avatar_id);
                avatarsToDelete.push(relation.right_avatar_id);
                relationsToDelete.push(relation.id);
            }
        });
    }

    return {avatarsToDelete, relationsToDelete};
};
