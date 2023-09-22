import React from 'react';

import {Button, DropdownMenu, Icon, Popover} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import {
    RELATION_TYPES,
    TEXT_LIMIT,
    getClampedText,
    getDialogRowIcon,
    getLinkIcon,
    getRelationDetailsKey,
    getRelationsText,
} from '../../helpers';
import {AliasClickHandlerData, DashkitMetaDataItem, RelationType} from '../../types';

import iconInfo from 'assets/icons/info.svg';
import iconAlias from 'assets/icons/relations-alias.svg';

import './Content.scss';

const b = block('dialog-relations-content');
const i18n = I18n.keyset('component.dialog-relations.view');
const ICON_SIZE = 16;

type RowParams = {
    data: DashkitMetaDataItem;
    widgetMeta: DashkitMetaDataItem;
    onChange: (props: {type: RelationType; widgetId: DashkitMetaDataItem['widgetId']}) => void;
    onAliasClick?: (props: AliasClickHandlerData) => void;
    showDebugInfo: boolean;
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

    const widgetLabel =
        widget?.label && widget?.title !== widget?.label ? `${widget?.label} — ` : '';
    const rowLabel = row?.label && row?.title !== row?.label ? `${row?.label} — ` : '';

    const tooltipContent = (
        <React.Fragment>
            {getRelationDetailsText({
                text: i18n(getRelationDetailsKey(relationType)),
                linkType: relationType as RelationType,
                widget: `${widgetLabel} ${getClampedText(widget.title)}`,
                row: `${rowLabel} ${getClampedText(row.title)}`,
                withStrong: true,
            })}
            {showByField && fieldTextWithStrong}
        </React.Fragment>
    );

    const tooltipTitle =
        widget.title?.length > TEXT_LIMIT || row.title?.length > TEXT_LIMIT
            ? getRelationDetailsText({
                  text: i18n(getRelationDetailsKey(relationType)),
                  linkType: relationType as RelationType,
                  widget: `${widgetLabel} ${widget.title}`,
                  row: `${rowLabel} ${row.title}`,
              }) + (showByField ? fieldText : '')
            : undefined;

    return {tooltipContent, tooltipTitle};
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
    onChange: RowParams['onChange'];
}) =>
    items.map((item) => ({
        action: () => {
            onChange({type: item, widgetId: currentRow.widgetId});
        },
        icon: <Icon data={getLinkIcon(item)} size={ICON_SIZE} className={b('icon-link', item)} />,
        text: (
            <div className={b('list-link')}>
                <span>{i18n(`label_${item}`)}</span>
                <div className={b('info-text')}>
                    {getRelationDetailsText({
                        text: i18n(getRelationDetailsKey(item)),
                        linkType: item as RelationType,
                        widget: getClampedText(currentWidget),
                        row: getClampedText(currentRow.title),
                    })}
                </div>
            </div>
        ),
        className: b('list-row'),
    }));

export const Row = ({data, widgetMeta, onChange, onAliasClick, showDebugInfo}: RowParams) => {
    const handleAliasCLick = React.useCallback(() => {
        onAliasClick?.({
            currentRow: data,
            showDebugInfo,
        });
    }, [data, widgetMeta, showDebugInfo, onAliasClick]);

    if (!data || !widgetMeta) {
        return null;
    }

    const icon = getDialogRowIcon(data, b('icon-row'));
    const relations = data.relations;
    const {type: relationType, available: availableRelations, byFields, byAliases} = relations;

    const relationTypeText = i18n(getRelationsText(relationType));

    const items = getDropdownItems({
        items: availableRelations,
        currentWidget: widgetMeta.title,
        currentRow: data,
        onChange,
    });

    const {tooltipContent, tooltipTitle} = getTooltipInfo({
        widget: widgetMeta,
        row: data,
        relationType,
        byFields,
        byAliases,
    });

    const showAliasIcon = Boolean(data.loaded);

    const label = data?.label && data?.label !== data.title ? `${data?.label} — ` : '';
    const debugInfo = showDebugInfo ? <span className={b('info')}> ({data.widgetId})</span> : null;
    const title = (showDebugInfo ? `(${data.widgetId}) ` : '') + label + data.title;
    const rowTitle = label + data.title;

    return (
        <div className={b('row')}>
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
                        className={b('button-alias')}
                        onClick={handleAliasCLick}
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
                                <Button view="flat" className={b('button-link')}>
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
                        >
                            <Icon data={iconInfo} size={ICON_SIZE} className={b('icon-info')} />
                        </Popover>
                    </React.Fragment>
                )}
            </div>
        </div>
    );
};
