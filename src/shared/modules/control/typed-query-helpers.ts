//Currently selector supports only one column for distincts, so we always should take data from 0 index in rows
import type {ConnectionTypedQueryApiDataRow} from '../../types';

const CONTROL_DISTINCT_ROW_INDEX = 0;

export const getControlDisticntsFromRows = (rows: ConnectionTypedQueryApiDataRow[]): string[] => {
    return rows.reduce((acc: string[], row) => {
        const data = String(row[CONTROL_DISTINCT_ROW_INDEX]);
        acc.push(data);
        return acc;
    }, [] as string[]);
};
