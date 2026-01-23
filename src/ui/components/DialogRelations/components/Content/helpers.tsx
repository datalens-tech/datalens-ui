import React from 'react';

import {I18n, i18n} from 'i18n';

import {RELATION_TYPES, TEXT_LIMIT} from '../../constants';
import type {RelationType} from '../../types';

import type {
    ConnectionByAliasesProp,
    ConnectionByFieldsProp,
    ConnectionByUsedParamsProp,
    ConnectionField,
    ConnectionIndirectAliasesProp,
    ConnectionType,
} from './types';

import iconReverse from 'ui/assets/icons/arr-reverse.svg';
import iconRight from 'ui/assets/icons/arr-right.svg';
import iconNoData from 'ui/assets/icons/relations-no-data.svg';
import iconNoLink from 'ui/assets/icons/relations-no-link.svg';

const i18nKeyset = I18n.keyset('component.dialog-relations.view');

const labelsMap = {
    field: {
        singleLabel: i18nKeyset('label_by-field'),
        multiLabel: i18nKeyset('label_by-fields'),
    },
    alias: {
        singleLabel: i18nKeyset('label_by-alias'),
        multiLabel: i18nKeyset('label_by-aliases'),
    },
    param: {
        singleLabel: i18nKeyset('label_by-parameter'),
        multiLabel: i18nKeyset('label_by-parameters'),
    },
};

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

export const getRelationDetailsText = ({
    text,
    linkType,
    widget,
    row,
    withStrong,
}: {
    text: string;
    linkType: RelationType;
    widget: string;
    row: string;
    withStrong?: boolean;
}): string | React.ReactElement => {
    const formatOutput = (
        widgetNameText: string,
        rowNameText: string,
    ): string | React.ReactElement => {
        if (withStrong) {
            return (
                <React.Fragment>
                    <strong>{widgetNameText}</strong> {text} <strong>{rowNameText}</strong>
                </React.Fragment>
            );
        }
        return `${widgetNameText} ${text} ${rowNameText}`;
    };

    if (linkType === RELATION_TYPES.output) {
        if (!row) {
            return '';
        }
        return formatOutput(widget, row);
    }

    if (linkType === RELATION_TYPES.input) {
        if (!widget) {
            return '';
        }
        return formatOutput(row, widget);
    }

    return text;
};

export const getFieldText = ({
    field,
    type,
    hasDataset,
}: {
    field: ConnectionField;
    type: ConnectionType;
    hasDataset: boolean;
}) => {
    let fieldText = '';
    let fieldTextWithStrong = null;

    if (type === 'indirect') {
        return {
            fieldText,
            fieldTextWithStrong,
        };
    }

    const byField = type === 'field' || type === 'param';
    const {singleLabel, multiLabel} = labelsMap[type];

    if (Array.isArray(field) && field.length) {
        const fieldLabel = field.length === 1 ? singleLabel : multiLabel;
        const fieldName = byField ? (Array.isArray(field) && field?.join(', ')) || '' : '';
        fieldText = ` ${fieldLabel} ${fieldName}`;

        const fieldNameWithStrong = byField ? <strong>{fieldName}</strong> : null;

        fieldTextWithStrong = (
            <React.Fragment>
                {' '}
                {fieldLabel} {fieldNameWithStrong}
            </React.Fragment>
        );
    } else if (type === 'field' && hasDataset && !field.length) {
        fieldText = ` ${i18nKeyset('label_by-dataset-fields')}`;
        fieldTextWithStrong = <React.Fragment>{fieldText}</React.Fragment>;
    }

    return {
        fieldText,
        fieldTextWithStrong,
    };
};

export const getConnectionByInfo = ({
    byFields,
    byUsedParams,
    byAliases,
    relationType,
    indirectAliases,
    hasDataset,
}: {
    relationType: RelationType;
    byFields: ConnectionByFieldsProp;
    byUsedParams: ConnectionByUsedParamsProp;
    byAliases: ConnectionByAliasesProp;
    indirectAliases: ConnectionIndirectAliasesProp;
    hasDataset: boolean;
}) => {
    const isUnknownRelation = relationType === RELATION_TYPES.unknown;
    const availableLink =
        relationType !== RELATION_TYPES.ignore && relationType !== RELATION_TYPES.unknown;

    const hasIndirectAliases = Boolean(indirectAliases.length);
    const hasUsedParams = Array.isArray(byUsedParams)
        ? Boolean(byUsedParams.length)
        : Boolean(byUsedParams);
    const showByUsedParams = hasUsedParams && availableLink;
    const hasFields = Array.isArray(byFields) ? Boolean(byFields.length) : Boolean(byFields);
    const showByField = hasFields && availableLink;
    const hasAliases = Array.isArray(byAliases) ? Boolean(byAliases.length) : Boolean(byAliases);
    const showByAlias = hasAliases && availableLink;

    let field: ConnectionField;
    let type: ConnectionType;

    switch (true) {
        case showByAlias: {
            field = byAliases;
            type = 'alias';
            break;
        }

        case showByField || (hasDataset && availableLink): {
            field = byFields;
            type = 'field';
            break;
        }

        case showByUsedParams: {
            field = byUsedParams;
            type = 'param';
            break;
        }

        case isUnknownRelation && hasIndirectAliases: {
            field = indirectAliases;
            type = 'indirect';
            break;
        }

        default: {
            field = [];
            type = 'field';
        }
    }

    const {fieldText, fieldTextWithStrong} = getFieldText({
        field,
        type,
        hasDataset,
    });

    return {
        showByField: showByField || hasDataset || showByAlias || showByUsedParams,
        fieldText,
        fieldTextWithStrong,
    };
};
