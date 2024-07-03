import type {Shared} from '../../../../shared';
import {PlaceholderId} from '../../../../shared';

export function getItemForShapeSection(visualization: Shared['visualization']) {
    const suitablePlaceholder = visualization.placeholders.find(
        (p) =>
            [PlaceholderId.Y, PlaceholderId.Y2].includes(p.id as PlaceholderId) &&
            p.items.length > 0,
    );
    return suitablePlaceholder?.items[0];
}
