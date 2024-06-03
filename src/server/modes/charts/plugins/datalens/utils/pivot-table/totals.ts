import type {ServerField} from '../../../../../../../shared';

type PivotDataTotal = {
    level: number;
};

const getSubTotalsFromFields = (fields: ServerField[]): PivotDataTotal[] => {
    return fields
        .map((field, index) => {
            const isSubTotalsEnabled = field.subTotalsSettings?.enabled;

            if (isSubTotalsEnabled) {
                return {
                    level: index,
                };
            }

            return undefined;
        })
        .filter((setting) => Boolean(setting)) as PivotDataTotal[];
};

type GetPivotTableSubTotals = {
    columnsFields: ServerField[];
    rowsFields: ServerField[];
};

export const getPivotTableSubTotals = ({rowsFields, columnsFields}: GetPivotTableSubTotals) => {
    return {
        rows: getSubTotalsFromFields(rowsFields),
        columns: getSubTotalsFromFields(columnsFields),
    };
};
