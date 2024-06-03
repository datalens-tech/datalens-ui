import type {Field, Placeholder} from '../../../../../shared';
import {isParameter, isPseudoField} from '../../../../../shared';

// eslint-disable-next-line complexity
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
    if (!fields.length || isPseudoField(item)) {
        return;
    }

    // If there is an up-to-date dataset, we compare it
    const existingField = fields.find((latestItem) => {
        return latestItem.guid === item.guid && latestItem.datasetId === item.datasetId;
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

    if (placeholder && existingField) {
        if (placeholder.checkAllowed && !placeholder.checkAllowed(item)) {
            item.conflict = 'wrong-type';
            item.undragable = true;
        }

        if (placeholder.allowedTypes && !placeholder.allowedTypes.has(item.type)) {
            item.conflict = 'wrong-type';
            item.undragable = true;
        }

        if (placeholder.allowedDataTypes && !placeholder.allowedDataTypes.has(item.data_type)) {
            item.conflict = 'wrong-type';
            item.undragable = true;
        }

        if (placeholder.allowedFinalTypes && !placeholder.allowedFinalTypes.has(item.type)) {
            item.conflict = 'wrong-type';
            item.undragable = true;
            item.valid = false;
        }
    }
}
