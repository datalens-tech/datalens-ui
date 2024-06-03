import type {Field} from '../../../../../../shared';
import {DATASET_FIELD_TYPES} from '../../../../../../shared';
import type {QlConfigResultEntryMetadataDataColumnOrGroup} from '../../../../../../shared/types/config/ql';

import {isGroup} from './misc-helpers';

const findIndexes = ({fields, forbiddenIndexes}: {fields: Field[]; forbiddenIndexes: number[]}) =>
    fields.reduce((result: number[], field: Field, fieldIndex: number) => {
        if (
            (field.cast === DATASET_FIELD_TYPES.INTEGER ||
                field.cast === DATASET_FIELD_TYPES.FLOAT) &&
            !forbiddenIndexes.includes(fieldIndex)
        ) {
            return [...result, fieldIndex];
        } else {
            return result;
        }
    }, []);

export const migrateLineVisualization = ({
    order,
    fields,
    rows,
}: {
    order: QlConfigResultEntryMetadataDataColumnOrGroup[];
    fields: Field[];
    rows: string[][];
}) => {
    let collectingX = false;
    let collectingY = false;
    let collectingColor = false;

    let xIndex = -1;
    let xFields: Field[] = [];
    let yIndexes: number[] = [];
    let colorIndexes: number[] = [];

    let xDeclared = false;
    let yDeclared = false;

    if (order.length) {
        order.forEach((item: QlConfigResultEntryMetadataDataColumnOrGroup) => {
            const itemIsGroup = isGroup(item);

            if (itemIsGroup && item.name === 'X') {
                collectingX = true;
                return;
            }

            if (itemIsGroup && item.name === 'Y') {
                collectingX = false;
                collectingY = true;
                return;
            }

            if (itemIsGroup && item.name === 'Colors') {
                collectingY = false;
                collectingColor = true;
                return;
            }

            if (itemIsGroup && item.name === 'Available') {
                collectingX = false;
                collectingY = false;
                collectingColor = false;
                return;
            }

            if (collectingX && !itemIsGroup) {
                xIndex = fields.findIndex((column) => column.title === item.name);

                xDeclared = true;
            }

            if (collectingY && !itemIsGroup) {
                const yIndex = fields.findIndex((column) => column.title === item.name);

                if (yIndex > -1) {
                    yIndexes.push(yIndex);
                }

                yDeclared = true;
            }

            if (collectingColor && !itemIsGroup) {
                colorIndexes.push(fields.findIndex((column) => column.title === item.name));
            }
        });

        if (xDeclared && xIndex === -1) {
            xIndex = fields.findIndex(
                (_column, index) => !yIndexes.includes(index) && !colorIndexes.includes(index),
            );
        }

        if (yDeclared) {
            const newYIndexes = findIndexes({
                fields,
                forbiddenIndexes: [...yIndexes, xIndex, ...colorIndexes],
            });

            yIndexes = [...yIndexes, ...newYIndexes];
        }
    } else {
        yIndexes = findIndexes({
            fields,
            forbiddenIndexes: [],
        });

        xIndex = fields.findIndex((_field, index) => !yIndexes.includes(index));

        colorIndexes = fields
            .map((_field, fieldIndex) => {
                const homogeneousValues: Set<string> = new Set();

                const homogeneity = rows.every((row, rowIndex) => {
                    const value = row[fieldIndex];

                    if (rowIndex === 0) {
                        homogeneousValues.add(value);

                        return true;
                    }

                    if (homogeneousValues.has(value)) {
                        return true;
                    } else {
                        return false;
                    }
                });

                return homogeneity ? -1 : fieldIndex;
            })
            .filter((index) => index !== -1 && xIndex !== index && !yIndexes.includes(index));

        colorIndexes.sort((colorIndex1: number, colorIndex2: number) => {
            if (fields[colorIndex1] && fields[colorIndex2]) {
                return fields[colorIndex1].title > fields[colorIndex2].title ? 1 : -1;
            } else {
                return 0;
            }
        });
    }

    if (xIndex > -1) {
        xFields = [fields[xIndex]];
    }

    const yFields: Field[] = [];

    yIndexes.forEach((index) => {
        if (index > -1) {
            yFields.push(fields[index]);
        }
    });

    const colors: Field[] = [];

    colorIndexes.forEach((index) => {
        if (index > -1) {
            colors.push(fields[index]);
        }
    });

    return {xFields, yFields, colors};
};

export const migratePieVisualization = ({
    order,
    fields,
}: {
    order: QlConfigResultEntryMetadataDataColumnOrGroup[];
    fields: Field[];
}) => {
    let colorIndex = -1;
    let measureIndex = -1;

    let collectingColor = false;
    let collectingMeasure = false;

    order.forEach((item: QlConfigResultEntryMetadataDataColumnOrGroup) => {
        const itemIsGroup = isGroup(item);

        if (itemIsGroup && item.name === 'Color') {
            collectingColor = true;
            return;
        }

        if (itemIsGroup && item.name === 'Measure') {
            collectingColor = false;
            collectingMeasure = true;
            return;
        }

        if (itemIsGroup && item.name === 'Available') {
            collectingMeasure = false;
            collectingColor = false;
            return;
        }

        if (collectingColor && !itemIsGroup) {
            colorIndex = fields.findIndex((column) => column.title === item.name);
        }

        if (collectingMeasure && !itemIsGroup) {
            measureIndex = fields.findIndex((column) => column.title === item.name);
        }
    });

    let colorFields: Field[] = [];
    let measureFields: Field[] = [];

    if (colorIndex > -1) {
        colorFields = [fields[colorIndex]];
    }

    if (measureIndex > -1) {
        measureFields = [fields[measureIndex]];
    }

    return {colorFields, measureFields};
};

export const migrateMetricVisualization = ({
    order,
    fields,
}: {
    order: QlConfigResultEntryMetadataDataColumnOrGroup[];
    fields: Field[];
}) => {
    let collectingMeasure = false;

    let measureIndex = -1;

    order.forEach((item) => {
        const itemIsGroup = isGroup(item);

        if (itemIsGroup && item.name === 'Measure') {
            collectingMeasure = true;
            return;
        }

        if (itemIsGroup && item.name === 'Available') {
            collectingMeasure = false;
            return;
        }

        if (collectingMeasure && !itemIsGroup) {
            measureIndex = fields.findIndex((column) => column.title === item.name);
        }
    });

    let measureFields: Field[] = [];

    if (measureIndex > -1) {
        measureFields = [fields[measureIndex]];
    }
    return {measureFields};
};

export const migrateTableVisualization = ({
    order,
    fields,
}: {
    order: QlConfigResultEntryMetadataDataColumnOrGroup[];
    fields: Field[];
}) => {
    let collectingColumns = false;

    const columnFields: Field[] = [];

    order.forEach((item: QlConfigResultEntryMetadataDataColumnOrGroup) => {
        const itemIsGroup = isGroup(item);

        if (itemIsGroup && item.name === 'Columns') {
            collectingColumns = true;
            return;
        }

        if (itemIsGroup && item.name === 'Available') {
            collectingColumns = false;
            return;
        }

        if (collectingColumns && !itemIsGroup) {
            const itemIndex = fields.findIndex((column) => column.title === item.name);

            if (itemIndex > -1) {
                columnFields.push(fields[itemIndex]);
            }
        }
    });

    return {columnFields};
};
