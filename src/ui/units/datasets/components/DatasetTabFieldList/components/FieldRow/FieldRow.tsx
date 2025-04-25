import React from 'react';

import type {DropdownMenuItemMixed} from '@gravity-ui/uikit';
import {Button, DropdownMenu, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {DatasetField} from 'shared';
import {DatasetTabSectionQA} from 'shared';

import type {FieldColumn, FieldRowControlSettings} from '../../types';

import iconCross from 'ui/assets/icons/cross.svg';

import './FieldRow.scss';

type FieldRowProps = {
    height?: string | number;
    columns: FieldColumn[];
    isHeader?: boolean;
    controlSettings?: FieldRowControlSettings;
    isValid?: boolean;
    field?: DatasetField;
};

type FieldRowControlProps = {
    controlSettings: FieldRowControlSettings;
    field: DatasetField;
};

const b = block('dataset-tab-field-list-row');

const FieldRowControl: React.FC<FieldRowControlProps> = ({
    controlSettings,
    field,
}: FieldRowControlProps) => {
    switch (controlSettings.type) {
        case 'button':
            return (
                <Button
                    view="flat"
                    qa={controlSettings.qa}
                    onClick={(e) => {
                        e.stopPropagation();
                        controlSettings.onButtonClick(field);
                    }}
                >
                    <Icon data={controlSettings.icon || iconCross} width={24} />
                </Button>
            );
        case 'menu': {
            const wrappedItems: DropdownMenuItemMixed<unknown[]> = controlSettings.items.map(
                (item) => ({
                    action: (event) => {
                        event.stopPropagation();
                        item.action(field);
                    },
                    text: item.text(field),
                    qa: item.qa,
                    theme: item.theme,
                }),
            );

            return (
                <DropdownMenu
                    size="s"
                    onSwitcherClick={(event) => {
                        event?.stopPropagation();
                    }}
                    defaultSwitcherProps={{
                        qa: DatasetTabSectionQA.FieldRowMenu,
                        size: 's',
                        width: 'max',
                    }}
                    popupProps={{placement: ['bottom-end', 'top-end']}}
                    items={wrappedItems}
                />
            );
        }
        default:
            return null;
    }
};

export const FieldRow: React.FC<FieldRowProps> = (props: FieldRowProps) => {
    const {columns, isHeader, height, controlSettings, field, isValid} = props;

    return (
        <div
            className={b({header: isHeader, invalid: !isValid && !isHeader})}
            style={{height: height || 41}}
            data-qa={isHeader ? DatasetTabSectionQA.FieldRowHeader : DatasetTabSectionQA.FieldRow}
        >
            {columns.map((column, index) => {
                const content = 'text' in column ? column.text : column.node;
                let style: React.CSSProperties | undefined;

                if (column.width) {
                    const width =
                        typeof column.width === 'string' ? column.width : `${column.width}px`;
                    style = {flex: `0 0 ${width}`};
                }

                return (
                    <span
                        key={index}
                        data-qa={column.qa}
                        style={style}
                        className={b('row-content', {header: isHeader})}
                    >
                        {content}
                    </span>
                );
            })}
            {Boolean(controlSettings) && (
                <div className={b('control-item')}>
                    <FieldRowControl controlSettings={controlSettings!} field={field!} />
                </div>
            )}
        </div>
    );
};
