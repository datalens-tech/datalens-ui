import React from 'react';

import {Button, DropdownMenu, Icon, Popover} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {DashCommonQa, DashRelationTypes} from 'shared';

import {DEFAULT_ICON_SIZE, RELATION_TYPES, TEXT_LIMIT} from '../../constants';
import {getDialogRowIcon} from '../../helpers';
import {AliasClickHandlerData, DashkitMetaDataItem, RelationType} from '../../types';

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
};

type RowParams = {
    data: DashkitMetaDataItem;
    widgetMeta: DashkitMetaDataItem;
    onChange: (props: ChangedRelationType & AliasClickHandlerData) => void;
    onAliasClick?: (props: AliasClickHandlerData) => void;
    showDebugInfo: boolean;
    widgetIcon: React.ReactNode;
};

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

const getFieldText = ({
    field,
    type,
}: {
    field: string[][] | string[] | string;
    type: 'field' | 'alias';
}) => {
    let fieldText = '';
    let fieldTextWithStrong = null;

    const byField = type === 'field';

    const singleLabel = byField ? i18n('label_by-field') : i18n('label_by-alias');
    const multiLabel = byField ? i18n('label_by-fields') : i18n('label_by-aliases');

    if (Array.isArray(field) && field.length) {
        const fieldLabel = field.length === 1 ? singleLabel : multiLabel;
        const fieldName = byField ? field.join(', ') : '';
        fieldText = ` ${fieldLabel} ${fieldName}`;

        const fieldNameWithStrong = byField ? <strong>{fieldName}</strong> : null;

        fieldTextWithStrong = (
            <React.Fragment>
                {' '}
                {fieldLabel} {fieldNameWithStrong}
            </React.Fragment>
        );
    }

    return {
        fieldText,
        fieldTextWithStrong,
    };
};

const getConnectionByInfo = ({
    byFields,
    byAliases,
    relationType,
}: {
    relationType: RelationType;
    byFields: string[] | string;
    byAliases: string[][] | string;
}) => {
    const availableLink =
        relationType !== RELATION_TYPES.ignore && relationType !== RELATION_TYPES.unknown;

    const hasFields = Array.isArray(byFields) ? Boolean(byFields.length) : Boolean(byFields);
    const showByField = hasFields && availableLink;
    const hasAliases = Array.isArray(byAliases) ? Boolean(byAliases.length) : Boolean(byAliases);
    const showByAlias = hasAliases && availableLink;

    const {fieldText, fieldTextWithStrong} = getFieldText({
        field: hasFields ? byFields : byAliases,
        type: hasFields ? 'field' : 'alias',
    });

    return {
        showByField: showByField || showByAlias,
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
}: {
    widget: DashkitMetaDataItem;
    row: DashkitMetaDataItem;
    relationType: RelationType;
    byFields: string[] | string;
    byAliases: string[][] | string;
}) => {
    const {fieldText, fieldTextWithStrong, showByField} = getConnectionByInfo({
        byFields,
        byAliases,
        relationType,
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
            onChange({type: item, widgetId: currentRow.widgetId});
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
    const {type: relationType, available: availableRelations, byFields, byAliases} = relations;

    const {tooltipContent, tooltipTitle, aliasDetailTitle} = getTooltipInfo({
        widget: widgetMeta,
        row: data,
        relationType,
        byFields,
        byAliases,
    });

    const icon = getDialogRowIcon(data, b('icon-row'), DEFAULT_ICON_SIZE);

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
            });
        },
        [aliasDetailTitle, data, icon, onChange, relationType, showDebugInfo, widgetIcon],
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

    const debugInfo = showDebugInfo ? <span className={b('info')}> ({data.widgetId})</span> : null;
    const rowTitle = getRowTitle(data.title, data.label);
    const title = (showDebugInfo ? `(${data.widgetId}) ` : '') + rowTitle;

    return (
        <div className={b('row')} data-qa={DashCommonQa.RelationsListRow}>
            <div className={b('left')}>
                {icon}
                <span className={b('text', {'with-icon': showAliasIcon})} title={title}>
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
