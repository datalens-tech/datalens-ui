import React from 'react';

import type {ColumnSettings} from 'shared';
import {DialogColumnSettingsQa} from 'shared';

import type {SectionWrapperProps} from '../../../../../../../components/SectionWrapper/SectionWrapper';
import {SectionWrapper} from '../../../../../../../components/SectionWrapper/SectionWrapper';
import {DialogRow} from '../../../components/DialogRow/DialogRow';
import type {ColumnSettingsState} from '../../hooks/useDialogColumnSettingsState';
import {getDefaultColumnWidthSettings} from '../../utils';
import {ColumnWidthSetting} from '../ColumnWidthSetting/ColumnWidthSetting';
import {FieldInfo} from '../FieldInfo/FieldInfo';

type ColumnWidthSettingsSectionProps = {
    fields: ColumnSettingsState;
    onError: (fieldId: string, error: boolean) => void;
    onUpdate: (
        fieldId: string,
        widthSettings: Partial<ColumnSettings['width']>,
        fieldPlaceholder: 'columns' | 'rows',
    ) => void;
    withCollapse: boolean;
    fieldPlaceholder: 'columns' | 'rows';
    title?: string;
};

export const ColumnWidthSettingsSection: React.FC<ColumnWidthSettingsSectionProps> = (
    props: ColumnWidthSettingsSectionProps,
) => {
    const {fields, onError, onUpdate, withCollapse, title, fieldPlaceholder} = props;
    const fieldGuids = Object.keys(fields);

    const collapseProps: SectionWrapperProps = {
        withCollapse,
        title,
    };

    const Wrapper = withCollapse ? SectionWrapper : React.Fragment;
    const wrapperProps = withCollapse ? collapseProps : {};

    return (
        <Wrapper {...wrapperProps}>
            {fieldGuids.map((guid, index) => {
                const field = fields[guid];
                const isLastElement = index === fieldGuids.length - 1;
                const customMargin = isLastElement && withCollapse ? '0px' : '20px';
                return (
                    <DialogRow
                        titleCustomWidth="178px"
                        customGapBetweenTitleAndSetting="16px"
                        rowCustomMarginBottom={customMargin}
                        key={guid}
                        title={
                            <FieldInfo
                                dataType={field.data_type}
                                title={field.title}
                                type={field.type}
                            />
                        }
                        setting={
                            <ColumnWidthSetting
                                radioButtonQa={`${DialogColumnSettingsQa.UnitRadioButtons}__${field.title}`}
                                inputQa={`${DialogColumnSettingsQa.WidthValueInput}__${field.title}`}
                                onError={(error) => {
                                    onError(guid, error);
                                }}
                                settings={
                                    field?.columnSettings?.width || getDefaultColumnWidthSettings()
                                }
                                onUpdate={(updateArgs) =>
                                    onUpdate(guid, updateArgs, fieldPlaceholder)
                                }
                            />
                        }
                    />
                );
            })}
        </Wrapper>
    );
};
