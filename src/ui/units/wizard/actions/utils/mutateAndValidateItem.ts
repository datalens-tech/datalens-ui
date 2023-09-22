import {Field, Placeholder, isParameter} from '../../../../../shared';

export function mutateAndValidateItem<T extends Field>({
    fields,
    item,
    placeholder,
}: {
    fields: Field[];
    item: T;
    placeholder?: Placeholder;
}): void {
    // We will validate the selected fields in the visualization section
    if (!fields.length || item.type === 'PSEUDO') {
        return;
    }

    // If there is an up-to-date dataset, we compare it
    const existingField = fields.find((latestItem) => {
        return latestItem.guid === item.guid;
    });

    if (isParameter(item)) {
        if (existingField && item.local) {
            delete item.local;
        }
        return;
    }

    item.conflict = undefined;

    if (!existingField) {
        item.conflict = 'not-existing';
        item.undragable = true;

        return;
    }

    if (item.valid) {
        delete item.conflict;
        delete item.undragable;
    } else {
        item.conflict = 'invalid';
        item.undragable = true;

        return;
    }

    if (placeholder) {
        if (existingField && placeholder.allowedTypes && !placeholder.allowedTypes.has(item.type)) {
            item.conflict = 'wrong-type';
            item.undragable = true;
        }

        if (
            existingField &&
            placeholder.allowedDataTypes &&
            !placeholder.allowedDataTypes.has(item.data_type)
        ) {
            item.conflict = 'wrong-type';
            item.undragable = true;
        }

        if (
            existingField &&
            placeholder.allowedFinalTypes &&
            !placeholder.allowedFinalTypes.has(item.type)
        ) {
            item.conflict = 'wrong-type';
            item.undragable = true;
            item.valid = false;
        }
    }
}
