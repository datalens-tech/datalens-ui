import type {TableHead} from 'shared';

import type {TData} from '../../../../../../../components/Table/types';

export function getRowAsMap(args: {row?: TData; head?: TableHead[]}) {
    const {row, head = []} = args;
    return row?.reduce(
        (acc, rowCell, index) => Object.assign(acc, {[head[index]?.id as string]: rowCell}),
        {},
    );
}
