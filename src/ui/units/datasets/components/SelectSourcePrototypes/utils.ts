import type {Dataset} from 'shared';

export const getClickableTypes = (
    connectionId?: string,
    replacementData: Dataset['options']['connections']['items'] = [],
) => {
    const replacementConnData = replacementData.find(({id}) => id === connectionId);

    if (!replacementConnData) {
        return undefined;
    }

    const result = replacementConnData.replacement_types.map(({conn_type}) => conn_type);

    return result.length ? result : undefined;
};
