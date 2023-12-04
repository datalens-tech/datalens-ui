import {DATASET_FIELD_TYPES, DatasetFieldType, Field} from '../../../../../../shared';

export const autofillLineVisualization = ({fields, rows}: {fields: Field[]; rows?: string[][]}) => {
    const yIndexes: number[] = [];
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

    const xIndex = fields.findIndex((_column, index) => !yIndexes.includes(index));

    let xFields: Field[] = [];

    if (xIndex > -1) {
        xFields = [fields[xIndex]];
    }

    const yFields: Field[] = [];

    yIndexes.forEach((index) => {
        yFields.push(fields[index]);
    });

    const colorIndexes: number[] = [];

    if (rows) {
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

        iToHomogeneity.forEach((_homogeneity, i) => {
            // Removed the uniformity check within CHARTS-5955
            // It may need to be returned in the future for more complex logic, but for now it is superfluous
            if (xIndex !== i && !yIndexes.includes(i)) {
                colorIndexes.push(i);
            }
        });
    }

    const colors: Field[] = [];

    colorIndexes.forEach((index) => {
        colors.push(fields[index]);
    });

    const result: {xFields: Field[]; yFields: Field[]; colors?: Field[]} = {
        xFields,
        yFields,
    };

    if (colors.length) {
        result.colors = colors;
    }

    return result;
};

export const autofillScatterVisualization = ({fields}: {fields: Field[]}) => {
    const xIndex = fields.findIndex(
        (column) =>
            column.cast === DATASET_FIELD_TYPES.INTEGER ||
            column.cast === DATASET_FIELD_TYPES.FLOAT,
    );

    const yIndex = fields.findIndex(
        (column, i) =>
            (column.cast === DATASET_FIELD_TYPES.INTEGER ||
                column.cast === DATASET_FIELD_TYPES.FLOAT) &&
            i !== xIndex,
    );

    const pointsIndex = fields.findIndex((_column, i) => i !== xIndex && i !== yIndex);

    let xFields: Field[] = [];
    let yFields: Field[] = [];
    let pointsFields: Field[] = [];

    if (xIndex > -1) {
        xFields = [fields[xIndex]];
    }

    if (yIndex > -1) {
        yFields = [fields[yIndex]];
    }

    if (pointsIndex > -1) {
        pointsFields = [fields[pointsIndex]];
    }

    return {
        xFields,
        yFields,
        pointsFields,
    };
};

export const autofillPieVisualization = ({fields}: {fields: Field[]}) => {
    const measureIndex = fields.findIndex(
        (field) =>
            field.cast === DATASET_FIELD_TYPES.INTEGER || field.cast === DATASET_FIELD_TYPES.FLOAT,
    );
    const colorIndex = fields.findIndex((_field, index) => index !== measureIndex);

    let colorFields: Field[] = [];
    let measureFields: Field[] = [];

    if (colorIndex > -1) {
        colorFields = [fields[colorIndex]];
    }

    if (measureIndex > -1) {
        measureFields = [fields[measureIndex]];
    }

    return {
        colorFields,
        measureFields,
    };
};

export const autofillMetricVisualization = ({fields}: {fields: Field[]}) => {
    // First of all, we need to find some numeric value for metric
    let measureIndex = fields.findIndex(
        (field) =>
            field.cast === DATASET_FIELD_TYPES.INTEGER || field.cast === DATASET_FIELD_TYPES.FLOAT,
    );

    // If there is no such value, then we will use any other available value
    if (measureIndex === -1 && fields.length > 0) {
        measureIndex = 0;
    }

    let measureFields: Field[] = [];

    if (measureIndex > -1) {
        measureFields = [fields[measureIndex]];
    }

    return {
        measureFields,
    };
};

export const autofillTreemapVisualization = ({fields}: {fields: Field[]}) => {
    const sizeIndex = fields.findIndex(
        (field) =>
            field.cast === DATASET_FIELD_TYPES.INTEGER || field.cast === DATASET_FIELD_TYPES.FLOAT,
    );
    const dimensionIndex = fields.findIndex((_field, index) => index !== sizeIndex);

    let dimensionFields: Field[] = [];
    let sizeFields: Field[] = [];

    if (dimensionIndex > -1) {
        dimensionFields = [fields[dimensionIndex]];
    }

    if (sizeIndex > -1) {
        sizeFields = [fields[sizeIndex]];
    }

    return {
        dimensionFields,
        sizeFields,
    };
};

export const autofillTableVisualization = ({fields}: {fields: Field[]}) => {
    const columnFields = fields.filter((column) => column.type !== DatasetFieldType.Pseudo);

    return {
        columnFields,
    };
};
