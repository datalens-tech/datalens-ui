import {i18n} from 'i18n';

import {RELATION_TYPES, TEXT_LIMIT} from '../../constants';
import type {RelationType} from '../../types';

import iconReverse from 'ui/assets/icons/arr-reverse.svg';
import iconRight from 'ui/assets/icons/arr-right.svg';
import iconNoData from 'ui/assets/icons/relations-no-data.svg';
import iconNoLink from 'ui/assets/icons/relations-no-link.svg';

export const getTextSeparator = (leftText: string, rightText: string) => {
    return leftText && rightText ? ` — ` : ' ';
};

export const getLinkIcon = (type: string) => {
    switch (type) {
        case 'ignore':
            return iconNoLink;
        case 'input':
        case 'output':
            return iconRight;
        case 'both':
            return iconReverse;
        default:
            return iconNoData;
    }
};

export const getClampedText = (text: string) =>
    text?.length > TEXT_LIMIT ? `${text.substr(0, TEXT_LIMIT)}...` : text;

export const getRelationsText = (type: RelationType): string => {
    switch (type) {
        case 'ignore':
            return 'label_ignore';
        case 'input':
            return 'label_input';
        case 'output':
            return 'label_output';
        case 'both':
            return 'label_both';
        case 'unknown':
            return 'label_unknown';
        default:
            return '';
    }
};

export const getRelationDetailsKey = (item: RelationType) => {
    switch (item) {
        case RELATION_TYPES.input:
        case RELATION_TYPES.output:
            return 'value_link-affect';
        case RELATION_TYPES.both:
            return 'value_link-both';
        case RELATION_TYPES.ignore:
            return 'value_link-ignore';
        case RELATION_TYPES.unknown:
        default:
            return 'value_link-unknown';
    }
};

export const getRowTitle = (title: string, label?: string) => {
    const itemLabel = label && label !== title ? label : '';
    const separator = getTextSeparator(itemLabel, title);
    const rowTitle = `${itemLabel}${separator}${title}`.trim();

    return rowTitle || i18n('component.dialog-relations.view', 'title-error');
};
