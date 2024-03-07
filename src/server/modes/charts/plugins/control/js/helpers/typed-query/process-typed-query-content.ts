import type {ConnectionTypedQueryApiResponse} from '../../../../../../../../shared';
import {getControlDisticntsFromRows} from '../../../../../../../../shared/modules/control/typed-query-helpers';
import type {ControlShared} from '../../../types';

export const processTypedQueryContent = (
    distincts: ConnectionTypedQueryApiResponse | undefined,
): ControlShared['content'] => {
    const rows = distincts?.data?.rows || [];

    return getControlDisticntsFromRows(rows).map((v) => ({title: v, value: v}));
};
