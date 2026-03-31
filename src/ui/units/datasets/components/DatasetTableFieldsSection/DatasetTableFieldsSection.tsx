import React from 'react';

import {Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {DatasetField} from 'shared';

import {DatasetTabFieldList} from '../DatasetTabFieldList/DatasetTabFieldList';
import type {
    FieldColumn,
    FieldListColumn,
    FieldRowControlSettings,
} from '../DatasetTabFieldList/types';
import type {DatasetTabSectionWrapperProps} from '../DatasetTabSection/DatasetTabSection';
import {DatasetTabSection} from '../DatasetTabSection/DatasetTabSection';

import './DatasetTableFieldsSection.scss';

const b = block('dataset-table-fields-section');

interface DatasetTableFieldsSectionProps extends Omit<DatasetTabSectionWrapperProps, 'children'> {
    fields: DatasetField[];
    headerColumns: FieldColumn[];
    columns: FieldListColumn[];
    readonlyNotice?: React.ReactNode;
    isListLoading?: boolean;
    controlSettings?: FieldRowControlSettings;
    checkIsRowValid?: (item: DatasetField) => boolean;
    onItemClick?: (item: DatasetField) => void;
    readonly: boolean;
}

export const DatasetTableFieldsSection = (props: DatasetTableFieldsSectionProps) => {
    const {
        isListLoading,
        readonlyNotice,
        controlSettings,
        fields,
        headerColumns,
        columns,
        readonly,
        onItemClick,
        checkIsRowValid,
        ...sectionProps
    } = props;
    return (
        <DatasetTabSection
            {...sectionProps}
            onConfirmClick={readonly ? undefined : props.onConfirmClick}
        >
            <div className={b('list')}>
                {readonly && readonlyNotice}
                {isListLoading ? (
                    <Loader className={b('loader')} />
                ) : (
                    <DatasetTabFieldList
                        readonly={readonly}
                        onItemClick={onItemClick}
                        fields={fields}
                        headerColumns={headerColumns}
                        columns={columns}
                        isLoading={props.isLoading}
                        controlSettings={controlSettings}
                        checkIsRowValid={checkIsRowValid}
                    />
                )}
            </div>
        </DatasetTabSection>
    );
};
