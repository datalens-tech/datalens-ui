import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import {getRelationsIcon} from '../../../../helpers';
import {AliasesContext} from '../../../../hooks/useRelations';
import type {DashkitMetaDataItem} from '../../../../types';

import './AliasesDetail.scss';

const b = block('dialog-aliases-detail');
const i18n = I18n.keyset('component.dialog-relations.view');

type AliasesDetailProps = {
    fieldName: string;
    widget: DashkitMetaDataItem;
    currentRow: DashkitMetaDataItem;
    items: Array<DashkitMetaDataItem & {intersectionParams: string[]}>;
};

export const AliasesDetail = ({fieldName, items}: AliasesDetailProps) => {
    const {showDebugInfo, invalidAliases} = React.useContext(AliasesContext);

    let content: React.ReactNode = items
        .map((item: DashkitMetaDataItem & {intersectionParams: string[]}, index: number) => {
            const icon = getRelationsIcon(item);
            const label = item?.label && item?.label !== item.title ? item?.label : '';
            const debugInfo = showDebugInfo ? (
                <span className={b('info')}> ({item.widgetId})</span>
            ) : null;
            const title = (showDebugInfo ? `(${item.widgetId}) ` : '') + label + item.title;
            const rowTitle = [label, item.title].filter(Boolean).join(` — `);
            return {
                node: (
                    <div className={b('row')} key={`linked-widgets-row-${item.widgetId}-${index}`}>
                        {icon}
                        <span className={b('text')} title={title}>
                            {debugInfo}
                            {rowTitle}
                        </span>
                    </div>
                ),
                text: rowTitle,
            } as {node: React.ReactNode; text: string};
        })
        .sort((prevItem, item) => prevItem.text.localeCompare(item.text))
        .map((item) => item.node);

    if (invalidAliases?.includes(fieldName)) {
        content = <div className={b('error')}>{i18n('label_invalid-alias')}</div>;
    }

    return (
        <div className={b()}>
            <div className={b('subtitle')}>
                {i18n('label_alias-detail-1') + fieldName
                    ? ` ${i18n('label_alias-detail-2')} ${fieldName}`
                    : ''}
            </div>
            <div className={b('content')}>{content}</div>
        </div>
    );
};
