import type {ServerField, ServerPlaceholder} from '../../../../../../../../shared';

export const getFieldFromPlaceholder = (
    placeholder: ServerPlaceholder,
): ServerField | undefined => {
    const placeholderItems = placeholder.items || [];

    return placeholderItems[0];
};
