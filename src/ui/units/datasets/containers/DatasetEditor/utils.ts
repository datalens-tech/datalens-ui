import type {DatasetField} from 'shared';

import type {EditorItemToDisplay} from '../../store/types';

export const getFilteredFields = (args: {
    filter: string;
    showHidden: boolean;
    fields?: DatasetField[];
}) => {
    const {filter, showHidden, fields = []} = args;

    return fields.filter(({title, hidden}) => {
        if (!showHidden && hidden) {
            return false;
        }

        return title.toLowerCase().includes(filter.toLowerCase());
    });
};

export const isShowHiddenFieldsUpdated = (
    prevItems: EditorItemToDisplay[],
    nextItems: EditorItemToDisplay[],
) => {
    const prevShowHiddenFields = prevItems.includes('hiddenFields');
    const nextShowHiddenFields = nextItems.includes('hiddenFields');

    return prevShowHiddenFields !== nextShowHiddenFields;
};
