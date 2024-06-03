import type {DatasetAvatarRelation, DatasetSource} from '../../../../../../shared';
import type {FreeformSource} from '../../types';

export const isSourceTypeConteinesInFreeformSources = (
    freeformSources: FreeformSource[],
    sourceType?: string,
) => {
    return freeformSources.some(
        ({source_type: freeformSourceType}) => freeformSourceType === sourceType,
    );
};

export const getFilteredSources = (sources: DatasetSource[], freeformSources: FreeformSource[]) => {
    return sources.filter((source) => {
        return isSourceTypeConteinesInFreeformSources(freeformSources, source.source_type);
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
