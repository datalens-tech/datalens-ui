import type {PlaceholderId} from '../../constants';
import type {Placeholder} from '../../types';

export const selectPlaceholders = <T extends PlaceholderId>(
    placeholders: Placeholder[] | undefined,
    ids: T[],
): Record<T, Placeholder | undefined> => {
    const uniqueIds = new Set(ids);
    return (placeholders ?? []).reduce(
        (selectedPlaceholders, p) => {
            const id = p.id as T;

            return uniqueIds.has(id)
                ? Object.defineProperty(selectedPlaceholders, id, {value: p})
                : selectedPlaceholders;
        },
        {} as Record<T, Placeholder | undefined>,
    );
};
