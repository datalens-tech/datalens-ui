import {SelectOption} from '@gravity-ui/uikit';
import {sortBy} from 'lodash';

const getCounterTitle = (id: string, name?: string) => (name ? `${name} (${id})` : id);

export const shapeCounterItems = (counters: {id: string; name?: string}[]): SelectOption[] => {
    const items: SelectOption[] = counters.map(({id, name}) => ({
        value: String(id),
        content: getCounterTitle(id, name),
    }));

    return sortBy(items, (item: SelectOption) => item.content);
};
