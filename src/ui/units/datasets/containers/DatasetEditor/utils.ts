import type {DatasetField} from 'shared';
import {matchFieldFilter} from 'ui/utils/helpers';

import type {EditorItemToDisplay} from '../../store/types';

export const getFilteredFields = (args: {
    filter: string;
    showHidden: boolean;
    dlDebugMode?: boolean;
    fields?: DatasetField[];
}) => {
    const {filter, showHidden, dlDebugMode = false, fields = []} = args;

    return fields.filter(({title, hidden, description, guid}) => {
        if (!showHidden && hidden) {
            return false;
        }

        return matchFieldFilter(filter, dlDebugMode, {title, description, guid});
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
