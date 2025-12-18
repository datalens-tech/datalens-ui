import React from 'react';

import {Button, Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {DatasetField} from 'shared';
import {DatasetTabSectionQA} from 'shared';
import {Interpolate} from 'ui';

import {DatasetTabFieldList} from '../DatasetTabFieldList/DatasetTabFieldList';
import type {
    FieldColumn,
    FieldListColumn,
    FieldRowControlSettings,
} from '../DatasetTabFieldList/types';

import './DatasetTabSection.scss';

const b = block('dataset-tab-section-wrapper');

type DatasetTabSectionWrapperProps = {
    title: string;
    description: string;
    onOpenDialogClick: () => void;
    openDialogButtonText: string;
    onItemClick?: (item: DatasetField) => void;
    fields: DatasetField[];
    headerColumns: FieldColumn[];
    columns: FieldListColumn[];
    isListUpdating: boolean;
    controlSettings?: FieldRowControlSettings;
    checkIsRowValid?: (item: DatasetField) => boolean;
    isListLoading?: boolean;
    qa?: string;
    readonly: boolean;
    readonlyNotice?: React.ReactNode;
};

export const DatasetTabSection: React.FC<DatasetTabSectionWrapperProps> = (
    props: DatasetTabSectionWrapperProps,
) => {
    const {
        title,
        description,
        openDialogButtonText,
        fields,
        headerColumns,
        columns,
        isListUpdating,
        controlSettings,
        isListLoading,
        qa,
        readonly,
        readonlyNotice,
    } = props;

    return (
        <div className={b(null, 'dataset_tab')} data-qa={qa}>
            <div className={b('content')}>
                <div className={b('section')}>
                    <div className={b('title')}>{title}</div>
                    <div className={b('description')}>
                        <Interpolate
                            text={description}
                            matches={{
                                br() {
                                    return <br />;
                                },
                            }}
                        />
                    </div>
                    <div className={b('list')}>
                        {readonly && readonlyNotice}
                        {isListLoading ? (
                            <Loader className={b('loader')} />
                        ) : (
                            <DatasetTabFieldList
                                readonly={readonly}
                                onItemClick={props.onItemClick}
                                fields={fields}
                                headerColumns={headerColumns}
                                columns={columns}
                                isLoading={isListUpdating}
                                controlSettings={controlSettings}
                                checkIsRowValid={props.checkIsRowValid}
                            />
                        )}
                    </div>
                    {!readonly && (
                        <Button
                            className={b('add-button')}
                            disabled={isListUpdating}
                            onClick={props.onOpenDialogClick}
                            qa={DatasetTabSectionQA.AddButton}
                        >
                            {openDialogButtonText}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
