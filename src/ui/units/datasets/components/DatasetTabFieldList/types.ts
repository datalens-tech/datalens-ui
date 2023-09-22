import React from 'react';

import {IconData} from '@gravity-ui/uikit';
import {DatasetField} from 'shared';

import {TitleColumnProps} from './components/TitleColumn/TitleColumn';
import {TypeColumnProps} from './components/TypeColumn/TypeColumn';
import {ValueColumnProps} from './components/ValueColumn/ValueColumn';
import {DatasetFieldListColumnType} from './constants';

export type ColumnWidth = string | number;

export type FieldColumn =
    | {
          text: string;
          width?: ColumnWidth;
          qa?: string;
      }
    | {
          node: React.ReactNode;
          width?: ColumnWidth;
          qa?: string;
      };

export type FieldHeaderColumn = FieldColumn & {columnType: FieldListColumn['columnType']};

export type TitleColumnType = {
    columnType: DatasetFieldListColumnType.Title;
    width?: ColumnWidth;
    getTitleProps: (item: DatasetField) => TitleColumnProps;
};
export type FieldTypeColumnType = {
    columnType: DatasetFieldListColumnType.Type;
    width?: ColumnWidth;
    getTypeProps: (item: DatasetField) => TypeColumnProps;
};
export type ValueColumnType = {
    columnType: DatasetFieldListColumnType.Value;
    width?: ColumnWidth;
    getValueProps: (item: DatasetField) => ValueColumnProps;
};

export type TextColumnType = {
    columnType: DatasetFieldListColumnType.Text;
    width?: ColumnWidth;
    getTextProps: (item: DatasetField) => {width?: number | string; value: string};
};
export type CustomNodeColumnType = {
    columnType: DatasetFieldListColumnType.Custom;
    getCustomNodeProps: (item: DatasetField) => {node?: React.ReactNode; width?: number | string};
};

export type ButtonControlArgs = {
    type: 'button';
    onButtonClick: (item: DatasetField) => void;
    icon?: IconData;
    qa?: string;
};

export type MenuControlItem = {
    action: (field: DatasetField) => void;
    text: (field: DatasetField) => string | React.ReactNode;
    qa?: string;
};

export type MenuControlArgs = {
    type: 'menu';
    items: MenuControlItem[];
};

export type FieldRowControlSettings = ButtonControlArgs | MenuControlArgs;

export type FieldListColumn =
    | TitleColumnType
    | FieldTypeColumnType
    | ValueColumnType
    | TextColumnType
    | CustomNodeColumnType;
