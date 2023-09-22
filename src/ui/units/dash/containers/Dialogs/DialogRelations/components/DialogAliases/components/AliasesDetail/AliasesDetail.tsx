import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {getDialogRowIcon} from 'ui/units/dash/containers/Dialogs/DialogRelations/helpers';
import {AliasesContext} from 'ui/units/dash/containers/Dialogs/DialogRelations/hooks/useRelations';
import {DashkitMetaDataItem} from 'ui/units/dash/containers/Dialogs/DialogRelations/types';

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
    const {showDebugInfo} = React.useContext(AliasesContext);

    const content = items.map((item: any, index: number) => {
        const icon = getDialogRowIcon(item, b('icon-widget'));
        const label = item?.label && item?.label !== item.title ? item?.label : '';
        const debugInfo = showDebugInfo ? (
            <span className={b('info')}> ({item.widgetId})</span>
        ) : null;
        const title = (showDebugInfo ? `(${item.widgetId}) ` : '') + label + item.title;
        const rowTitle = [label, item.title].filter(Boolean).join(` — `);
        return (
            <div className={b('row')} key={`linked-widgets-row-${item.widgetId}-${index}`}>
                {icon}
                <span className={b('text')} title={title}>
                    {debugInfo}
                    {rowTitle}
                </span>
            </div>
        );
    });

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
