import type {ConnectionTypedQueryApiResponse} from '../../../../../../../../shared';
import type {ControlShared} from '../../../types';

export const processTypedQueryContent = (
    distincts: ConnectionTypedQueryApiResponse | undefined,
): ControlShared['content'] => {
    const rows = distincts?.data?.rows || [];

    return rows.reduce((acc, row) => {
        const rowData = String(row[0]);
        acc.push({title: rowData, value: rowData});
        return acc;
    }, [] as ControlShared['content']);
};
