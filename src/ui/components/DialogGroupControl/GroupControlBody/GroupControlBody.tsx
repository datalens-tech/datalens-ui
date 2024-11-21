import React from 'react';

import {FormRow} from '@gravity-ui/components';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useSelector} from 'react-redux';
import {Feature} from 'shared';
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

import '../DialogGroupControl.scss';

const b = block('group-control-dialog');
const i18n = I18n.keyset('dash.group-controls-dialog.edit');

export const GroupControlBody: React.FC<{
    navigationPath: string | null;
    changeNavigationPath: (newNavigationPath: string) => void;
}> = (props) => {
    const elementType = useSelector(selectSelectorControlType);

    const isTypeNotCheckbox = elementType !== ELEMENT_TYPE.CHECKBOX;

    return (
        <React.Fragment>
            <FormRow label={i18n('label_source')}>
                <SelectorTypeSelect showExternalType={false} mode="select" />
            </FormRow>
            <div className={b('section')}>
                <CommonSettingsSection
                    hideCommonFields={true}
                    navigationPath={props.navigationPath}
                    changeNavigationPath={props.changeNavigationPath}
                />
            </div>
            <div className={b('section', {'top-divider': true})}>
                <InputTypeSelector />
            </div>
            <div className={b('section')}>
                <TitleRow />
            </div>
            {isTypeNotCheckbox && (
                <React.Fragment>
                    <div className={b('section')}>
                        <TitlePlacementRow />
                    </div>
                    <div className={b('section')}>
                        <InnerTitleRow />
                    </div>
                </React.Fragment>
            )}
            <div className={b('section', {'bottom-divider': true})}>
                <HintRow />
            </div>

            {!Utils.isEnabledFeature(Feature.ConnectionBasedControl) && (
                <div className={b('section')}>
                    <OperationSelector />
                </div>
            )}
            {isTypeNotCheckbox && (
                <div className={b('section')}>
                    <RequiredValueCheckbox />
                </div>
            )}
            <div className={b('section')}>
                <ValueSelector />
            </div>
        </React.Fragment>
    );
};
