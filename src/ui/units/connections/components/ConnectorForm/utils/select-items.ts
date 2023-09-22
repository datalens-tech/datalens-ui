import {SelectOption} from '@gravity-ui/uikit';

export const isSelectItemMissed = (items: SelectOption[], targetValue?: string) => {
    return Boolean(items.length) && items.findIndex(({value}) => value === targetValue) === -1;
};
