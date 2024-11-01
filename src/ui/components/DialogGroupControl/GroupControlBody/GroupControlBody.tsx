import React from 'react';

import {FormRow} from '@gravity-ui/components';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {Feature} from 'shared';
import type {SelectorElementType} from 'ui/units/dash/store/actions/dashTyped';
import Utils from 'ui/utils/utils';

import {ELEMENT_TYPE} from '../../../units/dash/containers/Dialogs/Control/constants';
import {HintRow} from '../../../units/dash/containers/Dialogs/Control2/Sections/AppearanceSection/Rows/HintRow/HintRow';
import {InnerTitleRow} from '../../../units/dash/containers/Dialogs/Control2/Sections/AppearanceSection/Rows/InnerTitleRow/InnerTitleRow';
import {TitlePlacementRow} from '../../../units/dash/containers/Dialogs/Control2/Sections/AppearanceSection/Rows/TitlePlacementRow/TitlePlacementRow';
import {TitleRow} from '../../../units/dash/containers/Dialogs/Control2/Sections/AppearanceSection/Rows/TitleRow/TitleRow';
import {CommonSettingsSection} from '../../../units/dash/containers/Dialogs/Control2/Sections/CommonSettingsSection/CommonSettingsSection';
import {InputTypeSelector} from '../../../units/dash/containers/Dialogs/Control2/Sections/CommonSettingsSection/InputTypeSelector/InputTypeSelector';
import {OperationSelector} from '../../../units/dash/containers/Dialogs/Control2/Sections/OperationSelector/OperationSelector';
import {RequiredValueCheckbox} from '../../../units/dash/containers/Dialogs/Control2/Sections/ValueSelector/RequiredValueCheckbox/RequiredValueCheckbox';
import {ValueSelector} from '../../../units/dash/containers/Dialogs/Control2/Sections/ValueSelector/ValueSelector';
import {SelectorTypeSelect} from '../../../units/dash/containers/Dialogs/Control2/SelectorTypeSelect/SelectorTypeSelect';

import '../DialogGroupControl.scss';

const b = block('group-control-dialog');
const i18n = I18n.keyset('dash.group-controls-dialog.edit');

export const GroupControlBody = ({elementType}: {elementType: SelectorElementType}) => {
    const isTypeNotCheckbox = elementType !== ELEMENT_TYPE.CHECKBOX;

    return (
        <React.Fragment>
            <FormRow label={i18n('label_source')}>
                <SelectorTypeSelect showExternalType={false} mode="select" />
            </FormRow>
            <div className={b('section')}>
                <CommonSettingsSection hideCommonFields={true} />
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
