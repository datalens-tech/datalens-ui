import React from 'react';

import {FormRow} from '@gravity-ui/components';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useSelector} from 'react-redux';
import {Feature} from 'shared';
import {ColorAccentRow} from 'ui/components/ControlComponents/Sections/AppearanceSection/Rows/ColorAccentRow/ColorAccentRow';
import {HintRow} from 'ui/components/ControlComponents/Sections/AppearanceSection/Rows/HintRow/HintRow';
import {InnerTitleRow} from 'ui/components/ControlComponents/Sections/AppearanceSection/Rows/InnerTitleRow/InnerTitleRow';
import {TitlePlacementRow} from 'ui/components/ControlComponents/Sections/AppearanceSection/Rows/TitlePlacementRow/TitlePlacementRow';
import {TitleRow} from 'ui/components/ControlComponents/Sections/AppearanceSection/Rows/TitleRow/TitleRow';
import {CommonSettingsSection} from 'ui/components/ControlComponents/Sections/CommonSettingsSection/CommonSettingsSection';
import {InputTypeSelector} from 'ui/components/ControlComponents/Sections/CommonSettingsSection/InputTypeSelector/InputTypeSelector';
import {OperationSelector} from 'ui/components/ControlComponents/Sections/OperationSelector/OperationSelector';
import {RequiredValueCheckbox} from 'ui/components/ControlComponents/Sections/ValueSelector/RequiredValueCheckbox/RequiredValueCheckbox';
import {ValueSelector} from 'ui/components/ControlComponents/Sections/ValueSelector/ValueSelector';
import {SelectorTypeSelect} from 'ui/components/ControlComponents/SelectorTypeSelect/SelectorTypeSelect';
import {ELEMENT_TYPE} from 'ui/store/constants/controlDialog';
import {selectSelectorControlType} from 'ui/store/selectors/controlDialog';
import Utils from 'ui/utils/utils';

import {FormSection} from '../../FormSection/FormSection';

import '../DialogGroupControl.scss';

export const b = block('group-control-dialog');
const i18n = I18n.keyset('dash.group-controls-dialog.edit');

export const GroupControlBody: React.FC<{
    navigationPath: string | null;
    changeNavigationPath: (newNavigationPath: string) => void;
}> = (props) => {
    const elementType = useSelector(selectSelectorControlType);

    const isTypeNotCheckbox = elementType !== ELEMENT_TYPE.CHECKBOX;

    return (
        <React.Fragment>
            <FormSection title={i18n('label_data')}>
                <FormRow label={i18n('label_source')} className={b('row')}>
                    <SelectorTypeSelect showExternalType={false} mode="select" />
                </FormRow>
                <CommonSettingsSection
                    className={b('row')}
                    hideCommonFields={true}
                    navigationPath={props.navigationPath}
                    changeNavigationPath={props.changeNavigationPath}
                />
            </FormSection>
            <FormSection title={i18n('label_filtration')}>
                <InputTypeSelector className={b('row')} />
                {!Utils.isEnabledFeature(Feature.ConnectionBasedControl) && (
                    <OperationSelector className={b('row')} />
                )}
                <ValueSelector rowClassName={b('row')} />
                {isTypeNotCheckbox && <RequiredValueCheckbox className={b('row')} />}
            </FormSection>
            <FormSection title={i18n('label_representation')}>
                <TitleRow className={b('row')} />
                {isTypeNotCheckbox && (
                    <React.Fragment>
                        <TitlePlacementRow className={b('row')} />
                        <InnerTitleRow className={b('row')} />
                        <ColorAccentRow className={b('row')} />
                    </React.Fragment>
                )}
                <HintRow className={b('row')} />
            </FormSection>
        </React.Fragment>
    );
};
