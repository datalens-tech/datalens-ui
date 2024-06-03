import React from 'react';

import {Button, DropdownMenu, Icon, Popover} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {DashCommonQa, DashRelationTypes} from 'shared';

import {RELATION_TYPES, TEXT_LIMIT} from '../../constants';
import {getRelationsIcon} from '../../helpers';
import type {AliasClickHandlerData, DashkitMetaDataItem, RelationType} from '../../types';

import {
    getClampedText,
    getLinkIcon,
    getRelationDetailsKey,
    getRelationsText,
    getRowTitle,
    getTextSeparator,
} from './helpers';

import iconInfo from 'assets/icons/info.svg';
import iconAlias from 'assets/icons/relations-alias.svg';

import './Content.scss';

const b = block('dialog-relations-content');
const i18n = I18n.keyset('component.dialog-relations.view');
const ICON_SIZE = 16;

type ChangedRelationType = {
    type: RelationType;
    widgetId: DashkitMetaDataItem['widgetId'];
    itemId: DashkitMetaDataItem['itemId'];
};

type RowParams = {
    data: DashkitMetaDataItem;
    widgetMeta: DashkitMetaDataItem;
    onChange: (props: ChangedRelationType & AliasClickHandlerData) => void;
    onAliasClick?: (props: AliasClickHandlerData) => void;
    showDebugInfo: boolean;
    widgetIcon: React.ReactNode;
};

type ConnectionByFieldsProp = string[] | string;
type ConnectionByUsedParamsProp = string[] | string;
type ConnectionByAliasesProp = string[][] | string;
type ConnectionIndirectAliasesProp = string[][];

type ConnectionField =
    | ConnectionByFieldsProp
    | ConnectionByUsedParamsProp
    | ConnectionByAliasesProp
    | ConnectionIndirectAliasesProp;
type ConnectionType = 'alias' | 'field' | 'param' | 'indirect';

const getRelationDetailsText = ({
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
}) => {
    const widgetNameTextWrapped = withStrong ? <strong>{widget}</strong> : widget;
    const rowNameTextWrapped = withStrong ? <strong>{row}</strong> : row;
    if (linkType === RELATION_TYPES.output) {
        if (!rowNameTextWrapped) {
            return '';
        }
        return withStrong ? (
            <React.Fragment>
                {widgetNameTextWrapped} {text} {rowNameTextWrapped}
            </React.Fragment>
        ) : (
            `${widgetNameTextWrapped} ${text} ${rowNameTextWrapped}`
        );
    }
    if (linkType === RELATION_TYPES.input) {
        if (!widgetNameTextWrapped) {
            return '';
        }
        return withStrong ? (
            <React.Fragment>
                {rowNameTextWrapped} {text} {widgetNameTextWrapped}
            </React.Fragment>
        ) : (
            `${rowNameTextWrapped} ${text} ${widgetNameTextWrapped}`
        );
    }
    return text;
};

const labelsMap = {
    field: {
        singleLabel: i18n('label_by-field'),
        multiLabel: i18n('label_by-fields'),
    },
    alias: {
        singleLabel: i18n('label_by-alias'),
        multiLabel: i18n('label_by-aliases'),
    },
    param: {
        singleLabel: i18n('label_by-parameter'),
        multiLabel: i18n('label_by-parameters'),
    },
};

const getFieldText = ({
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
        fieldText = ` ${i18n('label_by-dataset-fields')}`;
        fieldTextWithStrong = <React.Fragment>{fieldText}</React.Fragment>;
    }

    return {
        fieldText,
        fieldTextWithStrong,
    };
};

const getConnectionByInfo = ({
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

export const getTooltipInfo = ({
    widget,
    row,
    relationType,
    byFields,
    byAliases,
    byUsedParams,
    indirectAliases,
    hasDataset,
}: {
    widget: DashkitMetaDataItem;
    row: DashkitMetaDataItem;
    relationType: RelationType;
    byFields: ConnectionByFieldsProp;
    byAliases: ConnectionByAliasesProp;
    byUsedParams: ConnectionByUsedParamsProp;
    indirectAliases: ConnectionIndirectAliasesProp;
    hasDataset: boolean;
}) => {
    const {fieldText, fieldTextWithStrong, showByField} = getConnectionByInfo({
        byFields,
        byAliases,
        relationType,
        byUsedParams,
        indirectAliases,
        hasDataset,
    });

    const widgetLabel = widget?.label && widget?.title !== widget?.label ? `${widget?.label}` : '';
    const rowLabel = row?.label && row?.title !== row?.label ? `${row?.label}` : '';

    const tooltipWidgetTitle = getClampedText(widget.title);
    const tooltipRowTitle = getClampedText(row.title);

    const tooltipWidgetSeparator = getTextSeparator(widgetLabel, tooltipWidgetTitle);
    const tooltipRowSeparator = getTextSeparator(rowLabel, tooltipRowTitle);

    const tooltipContent = (
        <React.Fragment>
            {getRelationDetailsText({
                text: i18n(getRelationDetailsKey(relationType)),
                linkType: relationType as RelationType,
                widget: `${widgetLabel}${tooltipWidgetSeparator}${tooltipWidgetTitle}`,
                row: `${rowLabel}${tooltipRowSeparator}${tooltipRowTitle}`,
                withStrong: true,
            })}
            {showByField && fieldTextWithStrong}
        </React.Fragment>
    );

    const widgetTitle = widget.title;
    const rowTitle = row.title;

    const widgetSeparator = getTextSeparator(widgetLabel, widgetTitle);
    const rowSeparator = getTextSeparator(rowLabel, rowTitle);

    const tooltipTitle =
        widget.title?.length > TEXT_LIMIT || rowTitle?.length > TEXT_LIMIT
            ? getRelationDetailsText({
                  text: i18n(getRelationDetailsKey(relationType)),
                  linkType: relationType as RelationType,
                  widget: `${widgetLabel}${widgetSeparator}${widgetTitle}`,
                  row: `${rowLabel}${rowSeparator}${rowTitle}`,
              }) + (showByField ? fieldText : '')
            : undefined;

    const aliasDetailTitle = (
        <React.Fragment>
            {getRelationDetailsText({
                text: i18n(getRelationDetailsKey(relationType)),
                linkType: relationType as RelationType,
                widget: `${widgetLabel}${widgetSeparator}${widgetTitle}`,
                row: `${rowLabel}${rowSeparator}${rowTitle}`,
                withStrong: true,
            })}
            {showByField ? fieldText : ''}
        </React.Fragment>
    );

    return {
        tooltipContent,
        tooltipTitle,
        aliasDetailTitle,
    };
};

const getDropdownItems = ({
    items,
    currentWidget,
    currentRow,
    onChange,
}: {
    items: Array<RelationType>;
    currentWidget: string;
    currentRow: DashkitMetaDataItem;
    onChange: (props: ChangedRelationType) => void;
}) =>
    items.map((item) => ({
        action: () => {
            onChange({type: item, widgetId: currentRow.widgetId, itemId: currentRow.itemId});
        },
        icon: <Icon data={getLinkIcon(item)} size={ICON_SIZE} className={b('icon-link', item)} />,
        text: (
            <div className={b('list-link')} data-qa={DashRelationTypes[item as RelationType]}>
                <span>{i18n(`label_${item}`)}</span>
                <div className={b('info-text')}>
                    {getRelationDetailsText({
                        text: i18n(getRelationDetailsKey(item)),
                        linkType: item as RelationType,
                        widget: getClampedText(currentWidget),
                        row: getClampedText(currentRow.title || currentRow.label || ''),
                    })}
                </div>
            </div>
        ),
        className: b('list-row'),
    }));

export const Row = ({
    data,
    widgetMeta,
    onChange,
    onAliasClick,
    showDebugInfo,
    widgetIcon,
}: RowParams) => {
    const relations = data?.relations;
    const {
        type: relationType,
        available: availableRelations,
        indirectAliases,
        byFields,
        byAliases,
        byUsedParams,
        hasDataset,
        forceAddAlias,
    } = relations;

    const {tooltipContent, tooltipTitle, aliasDetailTitle} = getTooltipInfo({
        widget: widgetMeta,
        row: data,
        relationType,
        byFields,
        byAliases,
        byUsedParams,
        indirectAliases,
        hasDataset,
    });

    const icon = getRelationsIcon(data);

    const handleAliasCLick = React.useCallback(() => {
        onAliasClick?.({
            currentRow: data,
            showDebugInfo,
            relationText: aliasDetailTitle || '',
            relationType,
            widgetIcon,
            rowIcon: icon,
        });
    }, [data, showDebugInfo, onAliasClick, relationType, aliasDetailTitle, widgetIcon, icon]);

    const handleChange = React.useCallback(
        (changedData) => {
            onChange({
                ...changedData,
                currentRow: data,
                showDebugInfo,
                relationText: aliasDetailTitle || '',
                relationType,
                widgetIcon,
                rowIcon: icon,
                forceAddAlias,
            });
        },
        [
            aliasDetailTitle,
            data,
            icon,
            onChange,
            relationType,
            showDebugInfo,
            widgetIcon,
            forceAddAlias,
        ],
    );

    if (!data || !widgetMeta) {
        return null;
    }

    const relationTypeText = i18n(getRelationsText(relationType));

    const items = getDropdownItems({
        items: availableRelations,
        currentWidget: widgetMeta.title || widgetMeta.label || '',
        currentRow: data,
        onChange: handleChange,
    });

    const showAliasIcon = Boolean(data.loaded);

    const id = data.itemId ? `${data.widgetId} ${data.itemId}` : data.widgetId;

    const debugInfo = showDebugInfo ? <span className={b('info')}> ({id})</span> : null;
    const rowTitle = getRowTitle(data.title, data.label);
    const title = (showDebugInfo ? `(${id}) ` : '') + rowTitle;

    return (
        <div className={b('row')} data-qa={DashCommonQa.RelationsListRow}>
            <div className={b('left')}>
                <div className={b('left-inner')}>
                    <div className={b('icon')}>{icon}</div>
                    <span className={b('text')} title={title}>
                        {debugInfo}
                        {rowTitle}
                    </span>
                    {showAliasIcon && (
                        <Button
                            view="outlined"
                            size="s"
                            title={i18n('label_add-alias')}
                            className={b('button-alias')}
                            onClick={handleAliasCLick}
                            qa={DashCommonQa.AliasShowBtn}
                        >
                            <Icon data={iconAlias} className={b('icon-alias')} />
                        </Button>
                    )}
                </div>
            </div>
            <div className={b('right')}>
                {relationType && (
                    <React.Fragment>
                        <DropdownMenu
                            size="l"
                            items={items}
                            switcher={
                                <Button
                                    view="flat"
                                    className={b('button-link')}
                                    qa={DashCommonQa.RelationTypeButton}
                                >
                                    <span className={b('button-link-icon-wrap')}>
                                        <Icon
                                            data={getLinkIcon(relationType)}
                                            size={ICON_SIZE}
                                            className={b('icon-link', relationType)}
                                        />
                                    </span>
                                    {relationTypeText}
                                </Button>
                            }
                        />
                        <Popover
                            content={<div title={tooltipTitle}>{tooltipContent}</div>}
                            placement="bottom"
                            hasArrow={false}
                            qa={DashCommonQa.RelationsRowPopover}
                        >
                            <Icon data={iconInfo} size={ICON_SIZE} className={b('icon-info')} />
                        </Popover>
                    </React.Fragment>
                )}
            </div>
        </div>
    );
};
