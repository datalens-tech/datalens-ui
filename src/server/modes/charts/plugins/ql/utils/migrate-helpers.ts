import {DATASET_FIELD_TYPES, Field} from '../../../../../../shared';
import type {QlConfigResultEntryMetadataDataColumnOrGroup} from '../../../../../../shared/types/config/ql';

import {isGroup} from './misc-helpers';

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
    const yIndexes: number[] = [];
    const colorIndexes: number[] = [];

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
            const findNewYIndex = () =>
                fields.findIndex(
                    (column, index) =>
                        (column.cast === DATASET_FIELD_TYPES.INTEGER ||
                            column.cast === DATASET_FIELD_TYPES.FLOAT) &&
                        index !== xIndex &&
                        !colorIndexes.includes(index) &&
                        !yIndexes.includes(index),
                );

            let newFoundYIndex = findNewYIndex();

            while (newFoundYIndex > -1) {
                yIndexes.push(newFoundYIndex);

                newFoundYIndex = findNewYIndex();
            }
        }
    } else {
        const findNewYIndex = () =>
            fields.findIndex(
                (column, index) =>
                    (column.cast === DATASET_FIELD_TYPES.INTEGER ||
                        column.cast === DATASET_FIELD_TYPES.FLOAT) &&
                    !yIndexes.includes(index),
            );

        let newFoundYIndex = findNewYIndex();
        while (newFoundYIndex > -1) {
            yIndexes.push(newFoundYIndex);

            newFoundYIndex = findNewYIndex();
        }

        xIndex = fields.findIndex((_field, index) => !yIndexes.includes(index));

        const homogeneousValues: Set<String>[] = [];
        const iToHomogeneity: Boolean[] = [];
        rows.forEach((row) => {
            row.forEach((value, i) => {
                if (typeof homogeneousValues[i] === 'undefined') {
                    homogeneousValues[i] = new Set([value]);
                    iToHomogeneity[i] = true;
                } else if (iToHomogeneity[i] === false) {
                    return;
                } else if (!homogeneousValues[i].has(value)) {
                    iToHomogeneity[i] = false;
                }
            });
        });

        iToHomogeneity.forEach((homogeneity, i) => {
            if (!homogeneity && xIndex !== i && !yIndexes.includes(i)) {
                colorIndexes.push(i);
            }
        });

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
