import type {History} from 'history';

import type {AppDispatch} from '../../../../store';
import type {EmptyPlaceholderAction} from '../../../../units/collections/components/types';

export type CustomizeEmptyPlaceholder = (args: {
    dispatch: AppDispatch;
    history: History;
    canCreateWorkbook: boolean;
    curCollectionId: string | null;
    title: string;
    description?: string;
    actions: EmptyPlaceholderAction[];
}) => {
    title: string;
    description?: string;
    actions: EmptyPlaceholderAction[];
};
